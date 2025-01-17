/* eslint @typescript-eslint/dot-notation: 0 */

import Header from "components/Header";
import { ApiConfig } from "../../constants";
import React, { ChangeEvent, useEffect, useLayoutEffect } from "react";
import ApiService from "services/api.service";
import Input from "../../components/Elements/Input";
import Select from "../../components/Elements/Select";
import { useTypedSelector } from "hooks/useTypeSelector";
import { setDomainsList, setSettingsPrivateApiKey } from "reducers/settings";
import { useDispatch } from "react-redux";
import { useState } from "react";
import CSS from "csstype";
import Modal from "components/Elements/Modal";
import { toast } from "react-toastify";
import { GenericButton } from "components/Elements";
import ExclamationTriangleIcon from "@heroicons/react/24/solid/ExclamationTriangleIcon";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";

export const allEmailChannels = [
  {
    id: "free3",
    title: "Free 3 emails",
    subTitle: "Campaign: Onboarding Campaign",
    tooltip: "",
    disabled: false,
  },
  {
    id: "mailgun",
    title: "Mailgun",
    subTitle: "Campaign: Onboarding Campaign",
    tooltip: "",
    disabled: false,
  },
  {
    id: "sendgrid",
    title: "Sendgrid",
    subTitle: "for any campaign or newsletter",
    tooltip: "",
    disabled: false,
  },
  {
    id: "mailchimp",
    title: "Mailchimp",
    subTitle: "Campaign: Transactional Receipt",
    tooltip: "",
    disabled: true,
  },
  {
    id: "smtp",
    title: "SMTP",
    subTitle: "Setup your own email server",
    tooltip: "",
    disabled: true,
  },
];

export const allEventChannels = [
  {
    id: "segment",
    title: "Segment",
    subTitle: "for any campaign or newsletter",
    disabled: true,
  },
  {
    id: "posthog",
    title: "Posthog",
    subTitle: "Campaign: Onboarding Campaign",
    disabled: false,
  },
  {
    id: "rudderstack",
    title: "Rudderstack",
    subTitle: "Campaign: Transactional Receipt",
    disabled: true,
  },
];

const validators: { [key: string]: (value: string) => string | void } = {
  emailwithend: (value: string) => {
    if (value.match(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)) {
      return "You shouldn't pass full email here.";
    }
  },
  email: (value: string) => {
    if (!value?.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      return "You should pass email.";
    }
  },
};

const attributeKeys: { [key: string]: string } = {
  testSendingEmail: "emailwithend",
};

const expectedFields: Record<string, string[]> = {
  free3: ["testSendingEmail", "testSendingName"],
  mailgun: ["sendingName", "sendingEmail"],
  sendgrid: ["sendgridApiKey", "sendgridFromEmail"],
};

interface IntegrationsData {
  sendingName: string;
  sendingEmail: string;
  testSendingEmail: string;
  testSendingName: string;
  slackId: string;
  eventProvider: string;
  emailProvider: string;
  mailgunAPIKey: string;
  posthogApiKey: string;
  posthogProjectId: string;
  posthogHostUrl: string;
  posthogSmsKey: string;
  posthogEmailKey: string;
  sendgridApiKey: string;
  sendgridFromEmail: string;
}

export default function OnboardingBeta() {
  const { settings, domainsList } = useTypedSelector((state) => state.settings);
  const [integrationsData, setIntegrationsData] = useState<IntegrationsData>({
    sendingName: "",
    sendingEmail: "",
    testSendingEmail: "",
    testSendingName: "",
    slackId: "",
    mailgunAPIKey: "",
    eventProvider: "posthog",
    emailProvider: "",
    posthogApiKey: "",
    posthogProjectId: "",
    posthogHostUrl: "app.posthog.com",
    posthogSmsKey: "",
    posthogEmailKey: "",
    sendgridApiKey: "",
    sendgridFromEmail: "",
  });
  const dispatch = useDispatch();
  const [slackInstallUrl, setSlackInstallUrl] = useState<string>("");
  const [domainName, setDomainName] = useState<string>(
    settings.domainName || ""
  );
  const [domainList, setDomainList] = useState<{ name: string }[]>(
    domainsList || []
  );
  const [privateApiKey, setPrivateApiKey] = useState<string>("");
  const [nameModalOpen, setNameModalOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    [key: string]: string | undefined;
  }>({});
  const [verified, setVerified] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const callDomains = async () => {
    if (privateApiKey) {
      dispatch(setSettingsPrivateApiKey(privateApiKey));
      const response = await dispatch(setDomainsList(privateApiKey));
      if (response?.data) {
        setDomainList(response?.data);
      }
    }
  };

  useLayoutEffect(() => {
    const func = async () => {
      const { data } = await ApiService.get({
        url: `${ApiConfig.slackInstall}`,
      });
      setSlackInstallUrl(data);
    };
    func();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await ApiService.get({ url: "/accounts" });
      const {
        sendingName,
        sendingEmail,
        slackTeamId,
        mailgunAPIKey,
        posthogApiKey,
        posthogProjectId,
        posthogHostUrl,
        posthogSmsKey,
        posthogEmailKey,
        emailProvider,
        testSendingEmail,
        testSendingName,
        sendingDomain,
        verified: verifiedFromRequest,
        sendgridApiKey,
        sendgridFromEmail,
      } = data;
      setIntegrationsData({
        ...integrationsData,
        posthogApiKey: posthogApiKey || integrationsData.posthogApiKey,
        posthogProjectId: posthogProjectId || integrationsData.posthogProjectId,
        posthogHostUrl: posthogHostUrl || integrationsData.posthogHostUrl,
        posthogSmsKey: posthogSmsKey || integrationsData.posthogSmsKey,
        posthogEmailKey: posthogEmailKey || integrationsData.posthogEmailKey,
        sendingName: sendingName || integrationsData.sendingName,
        sendingEmail: sendingEmail || integrationsData.sendingEmail,
        emailProvider: emailProvider || integrationsData.emailProvider,
        testSendingEmail: testSendingEmail || integrationsData.testSendingEmail,
        testSendingName: testSendingName || integrationsData.testSendingName,
        slackId: slackTeamId?.[0] || integrationsData.slackId,
        sendgridApiKey: sendgridApiKey || integrationsData.sendgridApiKey,
        sendgridFromEmail:
          sendgridFromEmail || integrationsData.sendgridFromEmail,
      });
      setPrivateApiKey(mailgunAPIKey);
      setDomainName(sendingDomain);
      setVerified(verifiedFromRequest);
    })();
  }, []);

  const errorCheck = (e: {
    target: {
      name?: string;
      value?: string;
      custattribute?: string;
      getAttribute?: (str: string) => string | undefined;
    };
  }) => {
    let newError: string | void = undefined;
    if (!e.target.value) {
      newError = "Field can't be empty.";
    }
    const attribute =
      e.target?.getAttribute?.("data-spectype") || e.target?.custattribute;

    if (!newError && attribute && validators[attribute]) {
      newError = validators[attribute](e.target.value || "");
    }

    setErrors((prev) => ({
      ...prev,
      [e.target.name || ""]: newError as string,
    }));
    return !!newError;
  };

  const handleBlur = (e: {
    target: {
      name?: string;
      value?: string;
      custattribute?: string;
      getAttribute?: (str: string) => string | undefined;
    };
  }) => {
    errorCheck(e);
  };

  const handleIntegrationsDataChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (
      !["sendingName", "testSendingName"].includes(e.target.name) &&
      e.target.value.includes(" ")
    ) {
      e.target.value = e.target.value.replaceAll(" ", "");
      toast.error("Value should not contain spaces!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
    errorCheck(
      e as {
        target: {
          name?: string;
          value?: string;
          custattribute?: string;
          getAttribute?: (str: string) => string | undefined;
        };
      }
    );
    setIntegrationsData({
      ...integrationsData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const objToSend: Record<string, string> = {};
    for (const key of Object.keys(integrationsData)) {
      if (integrationsData[key as keyof IntegrationsData])
        objToSend[key] = integrationsData[key as keyof IntegrationsData];
    }

    let skip = false;

    if (integrationsData.emailProvider) {
      for (const key of expectedFields[integrationsData.emailProvider]) {
        if (
          errorCheck({
            target: {
              name: key,
              value: integrationsData?.[key as keyof IntegrationsData],
              custattribute: attributeKeys[key],
            },
          })
        ) {
          skip = true;
        }
      }
    }

    if (skip) {
      toast.error("Please check passed data", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }

    setIsLoading(true);
    try {
      await ApiService.patch({
        url: "/accounts",
        options: {
          ...objToSend,
          sendingDomain: domainName,
          mailgunAPIKey: privateApiKey,
        },
      });
    } catch (e) {
      let message = "Unexpected error";
      if (e instanceof AxiosError) message = e.response?.data?.message;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectUses = () => {
    setNameModalOpen(true);
  };

  const parametersToConfigure: { [key: string]: React.ReactElement } = {
    posthog: (
      <form className="flex flex-col gap-[10px]">
        <Input
          isRequired
          value={integrationsData.posthogApiKey}
          label="Private API Key"
          placeholder={"****  "}
          name="posthogApiKey"
          id="posthogApiKey"
          onChange={handleIntegrationsDataChange}
          onBlur={(e) =>
            handleBlur(
              e as {
                target: {
                  name?: string;
                  value?: string;
                  custattribute?: string;
                  getAttribute?: (str: string) => string | undefined;
                };
              }
            )
          }
        />
        <Input
          isRequired
          value={integrationsData.posthogProjectId}
          label="Project Id"
          placeholder={"****  "}
          name="posthogProjectId"
          id="posthogProjectId"
          onChange={handleIntegrationsDataChange}
          onBlur={(e) =>
            handleBlur(
              e as {
                target: {
                  name?: string;
                  value?: string;
                  custattribute?: string;
                  getAttribute?: (str: string) => string | undefined;
                };
              }
            )
          }
        />
        <Input
          isRequired
          value={integrationsData.posthogHostUrl}
          label="Posthog Url"
          placeholder={"https://app.posthog.com"}
          name="posthogHostUrl"
          id="posthogHostUrl"
          onChange={handleIntegrationsDataChange}
          onBlur={(e) =>
            handleBlur(
              e as {
                target: {
                  name?: string;
                  value?: string;
                  custattribute?: string;
                  getAttribute?: (str: string) => string | undefined;
                };
              }
            )
          }
        />
        <Input
          isRequired
          value={integrationsData.posthogSmsKey}
          label="Name of SMS / Phone number field on your Posthog person"
          placeholder={"$phoneNumber"}
          name="posthogSmsKey"
          id="posthogSmsKey"
          onChange={handleIntegrationsDataChange}
          onBlur={(e) =>
            handleBlur(
              e as {
                target: {
                  name?: string;
                  value?: string;
                  custattribute?: string;
                  getAttribute?: (str: string) => string | undefined;
                };
              }
            )
          }
        />
        <Input
          isRequired
          value={integrationsData.posthogEmailKey}
          label="Name of Email address field on your Posthog person"
          placeholder={"$email"}
          name="posthogEmailKey"
          id="posthogEmailKey"
          onChange={handleIntegrationsDataChange}
          onBlur={(e) =>
            handleBlur(
              e as {
                target: {
                  name?: string;
                  value?: string;
                  custattribute?: string;
                  getAttribute?: (str: string) => string | undefined;
                };
              }
            )
          }
        />
      </form>
    ),
    mailgun: (
      <>
        <Input
          isRequired
          value={privateApiKey}
          label="Private API Key"
          placeholder={"****  "}
          name="privateApiKey"
          id="privateApiKey"
          type="password"
          labelClass="!text-[16px]"
          onChange={(e) => {
            setPrivateApiKey(e.target.value);
            handleIntegrationsDataChange(e);
          }}
          isError={!!errors["privateApiKey"]}
          errorText={errors["privateApiKey"]}
          onBlur={(e) => {
            callDomains();
            handleBlur(
              e as {
                target: {
                  name?: string;
                  value?: string;
                  custattribute?: string;
                  getAttribute?: (str: string) => string | undefined;
                };
              }
            );
          }}
        />
        <Select
          id="activeJourney"
          value={domainName}
          options={domainList.map((item) => ({
            value: item.name,
          }))}
          onChange={(value) => {
            setDomainName(value);
          }}
          displayEmpty
          renderValue={(val) => val}
          sx={{
            height: "44px",
            margin: "20px 0px",
          }}
          inputProps={{
            "& .MuiSelect-select": {
              padding: "9px 15px",
              border: "1px solid #DEDEDE",
              boxShadow: "none",
              borderRadius: "3px",
            },
            sx: {
              borderRadius: "6px !important",
            },
          }}
        />
        <Input
          name="sendingName"
          id="sendingName"
          label="Sending name"
          value={integrationsData.sendingName}
          isError={!!errors["sendingName"]}
          errorText={errors["sendingName"]}
          onChange={handleIntegrationsDataChange}
          onBlur={(e) =>
            handleBlur(
              e as {
                target: {
                  name?: string;
                  value?: string;
                  custattribute?: string;
                  getAttribute?: (str: string) => string | undefined;
                };
              }
            )
          }
        />
        <div className="relative">
          <Input
            name="sendingEmail"
            id="sendingEmail"
            label="Sending email"
            value={integrationsData.sendingEmail}
            onChange={handleIntegrationsDataChange}
            className="pr-[150px]"
            isError={!!errors["sendingEmail"]}
            errorText={errors["sendingEmail"]}
            endText={domainName ? "@laudspeaker.com" : ""}
            onBlur={(e) =>
              handleBlur(
                e as {
                  target: {
                    name?: string;
                    value?: string;
                    custattribute?: string;
                    getAttribute?: (str: string) => string | undefined;
                  };
                }
              )
            }
          />
        </div>
      </>
    ),
    free3: (
      <>
        <Input
          name="testSendingName"
          id="testSendingName"
          label="Sending name"
          isError={!!errors["testSendingName"]}
          errorText={errors["testSendingName"]}
          value={integrationsData.testSendingName}
          onChange={handleIntegrationsDataChange}
          onBlur={(e) =>
            handleBlur(
              e as {
                target: {
                  name?: string;
                  value?: string;
                  custattribute?: string;
                  getAttribute?: (str: string) => string | undefined;
                };
              }
            )
          }
        />
        <div className="relative">
          <Input
            name="testSendingEmail"
            id="testSendingEmail"
            label="Sending email"
            data-spectype="emailwithend"
            value={integrationsData.testSendingEmail}
            onChange={handleIntegrationsDataChange}
            isError={!!errors["testSendingEmail"]}
            errorText={errors["testSendingEmail"]}
            className="pr-[210px]"
            endText={"@laudspeaker-test.com"}
            onBlur={(e) =>
              handleBlur(
                e as {
                  target: {
                    name?: string;
                    value?: string;
                    custattribute?: string;
                    getAttribute?: (str: string) => string | undefined;
                  };
                }
              )
            }
          />
        </div>
      </>
    ),
    sendgrid: (
      <>
        <Input
          isRequired
          value={integrationsData.sendgridApiKey}
          label="Private sendgrid API Key"
          placeholder={"****  "}
          name="sendgridApiKey"
          id="sendgridApiKey"
          type="password"
          isError={!!errors["sendgridApiKey"]}
          errorText={errors["sendgridApiKey"]}
          labelClass="!text-[16px]"
          onChange={handleIntegrationsDataChange}
          onBlur={(e) => {
            callDomains();
            handleBlur(
              e as {
                target: {
                  name?: string;
                  value?: string;
                  custattribute?: string;
                  getAttribute?: (str: string) => string | undefined;
                };
              }
            );
          }}
        />
        <Input
          isRequired
          value={integrationsData.sendgridFromEmail}
          label="Sendgrid email"
          placeholder={"your.email@sendgrid.com"}
          name="sendgridFromEmail"
          id="sendgridFromEmail"
          isError={!!errors["sendgridFromEmail"]}
          errorText={errors["sendgridFromEmail"]}
          type="text"
          labelClass="!text-[16px]"
          onChange={handleIntegrationsDataChange}
          onBlur={(e) =>
            handleBlur(
              e as {
                target: {
                  name?: string;
                  value?: string;
                  custattribute?: string;
                  getAttribute?: (str: string) => string | undefined;
                };
              }
            )
          }
        />
      </>
    ),
  };

  const frameOne: CSS.Properties = {
    position: "relative",
    height: "80vh",
  };

  const frameTwo: CSS.Properties = {
    height: "100%",
    width: "100%",
  };

  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const requiredKeys = expectedFields[integrationsData.emailProvider];
    if (!requiredKeys) return;
    const requiredValues = requiredKeys.map((key) => !errors[key]);
    setIsError(requiredValues.some((value) => !value));

    if (integrationsData.emailProvider) {
      for (const key of expectedFields[integrationsData.emailProvider]) {
        errorCheck({
          target: {
            name: key,
            value: integrationsData[key as keyof IntegrationsData],
            custattribute: attributeKeys[key],
          },
        });
      }
    }
  }, [integrationsData]);

  return (
    <>
      <div className="min-h-full">
        <div className="flex flex-1 flex-col">
          <Header />
          {!verified && (
            <div className="flex items-center py-[10px] px-[10px] md:px-[30px] bg-[#fffde9]">
              <ExclamationTriangleIcon className="w-[30px] h-[30px] text-[#ffe30c] mr-[20px]" />
              <div className="w-full flex flex-col">
                <span className="text-[#f3c276] text-[18px] leading-[24px] font-medium">
                  Email not verified.
                </span>
                <span className="text-[#f6d077] text-[14px] leading-[18px]">
                  Please check your inbox to verify your email. Once you have
                  you can test email sending. If you need to resend the email
                  verification go to{" "}
                  <Link to="/settings">
                    <u>settings.</u>
                  </Link>
                </span>
              </div>
            </div>
          )}
          <main className="flex-1 pb-8">
            <div className="grid place-items-center pt-6">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-transparent bg-cyan-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                onClick={redirectUses}
              >
                Check Out Onboarding Video
              </button>
            </div>
            <Modal
              isOpen={nameModalOpen}
              panelClass="max-w-[90%]"
              onClose={() => {
                setNameModalOpen(false);
              }}
            >
              <div style={frameOne}>
                <iframe
                  src="https://www.loom.com/embed/be35f72bd1d04dc5a9c972d2b92c82f8"
                  frameBorder="0"
                  style={frameTwo}
                ></iframe>
              </div>
            </Modal>
            {/* Page header */}
            <div className="bg-white shadow">
              <div className="px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8"></div>
            </div>
            <div className="relative mx-auto max-w-4xl md:px-8 xl:px-0">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"></div>
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1 p-5">
                  <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Email
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Add an email sending service to automatically send emails
                      to your customers.
                    </p>
                  </div>
                </div>
                <div className="mt-5 md:col-span-2 pd-5">
                  <form action="#" method="POST">
                    <div className="overflow-visible shadow sm:rounded-md">
                      <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                        <h2>Email configuration</h2>
                        <Select
                          id="email_config_select"
                          options={allEmailChannels.map((item) => ({
                            value: item.id,
                            title: item.title,
                            disabled:
                              item.id === "free3" && !verified
                                ? true
                                : item.disabled,
                            tooltip:
                              item.id === "free3" && !verified
                                ? "You need to verify your email"
                                : item.tooltip,
                          }))}
                          placeholder="select your email sending service"
                          value={integrationsData.emailProvider}
                          onChange={(value: string) => {
                            setIntegrationsData({
                              ...integrationsData,
                              emailProvider: value,
                            });
                            setErrors({});
                          }}
                        />

                        {integrationsData.emailProvider && (
                          <>
                            <h3 className="flex items-center text-[18px] font-semibold leading-[40px] mb-[10px]">
                              {integrationsData.emailProvider
                                .charAt(0)
                                .toUpperCase() +
                                integrationsData.emailProvider.slice(1)}{" "}
                              Configuration
                            </h3>
                            {
                              parametersToConfigure[
                                integrationsData.emailProvider
                              ]
                            }
                          </>
                        )}
                      </div>
                      <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                        <GenericButton
                          id="saveEmailConfiguration"
                          onClick={handleSubmit}
                          customClasses="inline-flex justify-center rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                          disabled={isError || isLoading}
                        >
                          Save
                        </GenericButton>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="hidden sm:block" aria-hidden="true">
                <div className="py-5">
                  <div className="border-t border-gray-200" />
                </div>
              </div>
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1 p-5">
                  <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Slack
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Install the Laudspeaker Slack App to automatically send
                      triggered Slack messages to your customers.
                    </p>
                  </div>
                </div>
                <div className="mt-5 md:col-span-2 pd-5">
                  <form action="#" method="POST">
                    <div className="shadow sm:overflow-hidden sm:rounded-md">
                      <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                        <h2>Slack configuration</h2>
                        <a
                          href={slackInstallUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <img
                            alt="add to slack"
                            src="https://platform.slack-edge.com/img/add_to_slack.png"
                            srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                            width="139"
                            height="40"
                          />
                        </a>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="hidden sm:block" aria-hidden="true">
                <div className="py-5">
                  <div className="border-t border-gray-200" />
                </div>
              </div>
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1 p-5">
                  <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Events
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Configure your event provider to send event data to
                      Laudspeaker so you can send triggered messages.
                    </p>
                  </div>
                </div>
                <div className="mt-5 md:col-span-2 pd-5">
                  <form action="#" method="POST">
                    <div className="shadow sm:rounded-md">
                      <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                        <h2>Events configuration</h2>
                        <Select
                          id="events_config_select"
                          options={allEventChannels.map((item) => ({
                            value: item.id,
                            title: item.title,
                            disabled: item.disabled,
                          }))}
                          value={integrationsData.eventProvider}
                          onChange={(value: string) =>
                            setIntegrationsData({
                              ...integrationsData,
                              eventProvider: value,
                            })
                          }
                        />
                        {integrationsData.eventProvider && (
                          <>
                            <h3 className="flex items-center text-[18px] font-semibold leading-[40px] mb-[10px]">
                              {integrationsData.eventProvider
                                .charAt(0)
                                .toUpperCase() +
                                integrationsData.eventProvider.slice(1)}{" "}
                              Configuration
                            </h3>
                            {
                              parametersToConfigure[
                                integrationsData.eventProvider
                              ]
                            }
                          </>
                        )}
                      </div>
                    </div>
                  </form>
                  <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

import { MenuOutlined } from "@ant-design/icons";
import { useWindowWidth } from "@react-hook/window-size";
import { Col, Drawer, Dropdown, Layout, Menu, Row } from "antd";
import lodash from "lodash";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "relay-hooks";

import {
  HelpPopup,
  Image,
  Link,
  NextLink,
  WalletConnection,
  AccountSettingsPopup as _AccountSettingsPopup,
  useWeb3,
} from ".";

import { appQuery } from "_pages/index/app-query";
import { useEvidenceFile } from "data";

// const { Paragraph } = Typography;
const { Header } = Layout;

function MyProfileLink(props) {
  const [accounts] = useWeb3("eth", "getAccounts");

  const { t } = useTranslation();

  const { props: profile } = useQuery(
    appQuery,
    {
      id: accounts?.[0]?.toLowerCase(),
      contributor: accounts?.[0]?.toLowerCase(),
    },
    { skip: !accounts?.[0] }
  );

  const showSubmitProfile =
    !profile?.submission ||
    (!profile?.submission?.registered &&
      profile?.submission?.status === "None");

  const href =
    accounts?.[0] && !showSubmitProfile ? "/profile/[id]" : "/profile/submit";
  const link =
    accounts?.[0] && !showSubmitProfile
      ? `/profile/${accounts?.[0]}`
      : `/profile/submit`;

  return (
    <NextLink href={href} as={link}>
      <Link
        {...props}
        className={
          window.location.pathname !== "/"
            ? "poh-header-text poh-header-text-mobile poh-drawer-button poh-header-text-selected"
            : "poh-header-text poh-header-text-mobile poh-drawer-button"
        }
        variant="navigation"
      >
        {showSubmitProfile
          ? t("header_submit_profile")
          : t("header_my_profile")}
      </Link>
    </NextLink>
  );
}

function LanguageDropdown() {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const languages = [
    { name: "🇬🇧 English", key: "en", emoji: "🇬🇧" },
    { name: "🇪🇸 Español", key: "es", emoji: "🇪🇸" },
    { name: "🇵🇹 Português", key: "pt", emoji: "🇵🇹" },
    { name: "🇫🇷 Français", key: "fr", emoji: "🇫🇷" },
    { name: "🇮🇹 Italiano", key: "it", emoji: "🇮🇹" },
    { name: "🇨🇳 中文", key: "cn", emoji: "🇨🇳" },
  ];

  // Remove hardcode to programatical list
  const languageMenu = (
    <Menu
      className="popup-language-menu"
      selectedKeys={[i18n.resolvedLanguage]}
    >
      {languages.map((language, i, list) => (
        <React.Fragment key={`${language.key}-divider`}>
          <Menu.Item
            className="header-language-item"
            key={language.key}
            onClick={() => changeLanguage(language.key)}
          >
            {language.name}
          </Menu.Item>
          {i + 1 === list.length ? null : <Menu.Divider />}
        </React.Fragment>
      ))}
    </Menu>
  );

  return (
    <Dropdown
      sx={{ minWidth: 200, width: 50, cursor: "pointer" }}
      overlay={languageMenu}
    >
      <div
        aria-hidden="true"
        className="poh-header-dropdown"
        onClick={(event) => event.preventDefault()}
        onKeyDown={(event) => event.preventDefault()}
      >
        {lodash.find(languages, (x) => x.key === i18n.resolvedLanguage).emoji}
      </div>
    </Dropdown>
  );
}

const normalizeSettings = ({ email, ...rest }) => ({
  email: { S: email },
  ...Object.keys(rest).reduce((acc, setting) => {
    acc[setting] = {
      BOOL: rest[setting] || false,
    };
    return acc;
  }, {}),
});

function AccountSettingsPopup() {
  const { t } = useTranslation();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { props } = useQuery(
    appQuery,
    {
      id: accounts?.[0]?.toLowerCase(),
      contributor: accounts?.[0]?.toLowerCase(),
    },
    { skip: !accounts?.[0] }
  );
  const evidenceURI = props?.submission?.requests[0].evidence[0].URI;
  const getEvidenceFile = useEvidenceFile();

  const evidence = evidenceURI ? getEvidenceFile(evidenceURI) : null;
  const displayName =
    [evidence?.file.firstName, evidence?.file.lastName]
      .filter(Boolean)
      .join(" ") || evidence?.file.name;

  const settings = {
    proofOfHumanityNotifications: {
      label: t("header_notifications_enable"),
      info: t("header_notifications_subscribe"),
    },
  };

  const parseSettings = (rawSettings) => ({
    ...Object.keys(settings).reduce((acc, setting) => {
      acc[setting] =
        rawSettings?.payload?.settings?.Item?.[setting]?.BOOL || false;
      return acc;
    }, {}),
    email: rawSettings?.payload?.settings?.Item?.email?.S || "",
  });

  return (
    <_AccountSettingsPopup
      name={displayName}
      photo={evidenceURI && getEvidenceFile(evidenceURI)?.file?.photo}
      userSettingsURL="https://hgyxlve79a.execute-api.us-east-2.amazonaws.com/production/user-settings"
      settings={settings}
      parseSettings={parseSettings}
      normalizeSettings={normalizeSettings}
    />
  );
}

function MobileNavbar({ toggleMobileMenuOpen }) {
  const [accounts] = useWeb3("eth", "getAccounts");

  return (
    <Row>
      <Col span={1}>
        <MenuOutlined
          style={{ color: "#fff" }}
          onClick={() => toggleMobileMenuOpen()}
        />
      </Col>
      <Col span={16}>
        <Row justify="center" align="middle">
          <Link href="/" variant="unstyled" sx={{ display: "flex" }}>
            <Image
              sx={{
                width: 130,
                minWidth: 130,
                marginTop: "10px",
                marginLeft: "80px",
              }}
              src="/images/democratic-poh-logo-white.svg"
              height="auto"
            />
          </Link>
        </Row>
      </Col>
      <Col span={7} className="mobile-navbar-button">
        <Row justify="end">
          <WalletConnection
            buttonProps={{
              sx: {
                backgroundColor: "transparent",
                backgroundImage: "none !important",
                color: "white",
                boxShadow: "none !important",
                fontSize: 16,
                border: "1px solid #ffffff1d",
                px: "16px !important",
                py: "8px !important",
                mx: [0, "4px", "8px"],
              },
            }}
            tagProps={{
              sx: {
                opacity: 0.8,
                fontSize: [20, 16, 12],
                mx: [0, "4px", "8px"],
              },
            }}
          />
          {accounts?.length !== 0 ? <AccountSettingsPopup /> : ""}
        </Row>
      </Col>
    </Row>
  );
}

function DesktopNavbar() {
  const { t } = useTranslation();
  const [accounts] = useWeb3("eth", "getAccounts");

  return (
    <Row>
      <Col span={3} style={{ display: "flex", alignItems: "center" }}>
        <Link
          href="https://proofofhumanity.eth.limo"
          target="_blank"
          variant="unstyled"
          sx={{ display: "flex" }}
        >
          <Image
            sx={{ width: 130, minWidth: 130, marginTop: "-3px" }}
            src="/images/democratic-poh-logo-white.svg"
            height="auto"
          />
        </Link>
      </Col>
      <Col className="poh-header-menu" span={11}>
        <Row justify="center">
          <Col span={17} className="poh-header-item">
            <NextLink href="/" as="/">
              <Link
                className={
                  window.location.pathname === "/"
                    ? "poh-header-text poh-header-text-selected"
                    : "poh-header-text"
                }
                variant="navigation"
              >
                {t("header_profiles")}
              </Link>
            </NextLink>
            <MyProfileLink />
          </Col>
        </Row>
      </Col>
      <Col flex="auto" span={11}>
        <Row justify="end" align="middle">
          <WalletConnection
            buttonProps={{
              sx: {
                backgroundColor: "transparent",
                backgroundImage: "none !important",
                color: "white",
                boxShadow: "none !important",
                fontSize: 16,
                border: "1px solid #ffffff1d",
                px: "16px !important",
                py: "8px !important",
                mx: [0, "4px", "8px"],
              },
            }}
            tagProps={{
              sx: {
                opacity: 0.8,
                fontSize: [20, 16, 12],
                mx: [0, "4px", "8px"],
              },
            }}
          />
          {accounts?.length !== 0 ? <AccountSettingsPopup /> : ""}
          <LanguageDropdown />
          <HelpPopup />
        </Row>
      </Col>
    </Row>
  );
}

export default function AppHeader() {
  const { t } = useTranslation();

  const width = useWindowWidth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function toggleMobileMenuOpen() {
    if (!mobileMenuOpen) {
      setMobileMenuOpen(true);
    } else {
      setMobileMenuOpen(false);
    }
  }

  const isDesktop = width >= 850;

  return (
    <>
      <Drawer
        width={200}
        placement="left"
        closable={false}
        onClose={() => setMobileMenuOpen(false)}
        visible={mobileMenuOpen}
      >
        <Row onClick={() => setMobileMenuOpen(false)}>
          <NextLink href="/" as="/">
            <Link
              className={
                window.location.pathname === "/"
                  ? "poh-header-text poh-header-text-mobile poh-drawer-button poh-header-text-selected"
                  : "poh-header-text poh-header-text-mobile poh-drawer-button"
              }
              variant="navigation"
            >
              {t("header_profiles")}
            </Link>
          </NextLink>
        </Row>
        <Row onClick={() => setMobileMenuOpen(false)}>
          <MyProfileLink className="poh-header-text poh-header-text-mobile poh-drawer-button" />
        </Row>
      </Drawer>
      <Header className="poh-header">
        {isDesktop ? (
          <DesktopNavbar />
        ) : (
          <MobileNavbar toggleMobileMenuOpen={toggleMobileMenuOpen} />
        )}
      </Header>
    </>
  );
}

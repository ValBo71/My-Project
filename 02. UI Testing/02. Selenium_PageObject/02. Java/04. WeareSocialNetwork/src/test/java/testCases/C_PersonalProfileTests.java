package testCases;

import org.junit.Before;
import org.junit.Test;
import testCases.BaseTest;
import testCases.DataConstants;
import testCases.PageHeaderText;

import java.util.Locale;

public class C_PersonalProfileTests extends BaseTest {


//    @Before
//    public void Authenticate() {
//        basePage.clickSignInLink();
//        actions.waitForElementVisibleUntilTimeout("page.header", 30);
//        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
//        loginPage.authenticate(DataConstants.ADMIN_USERNAME, DataConstants.PASSWORD);
//        loginPage.clickSignInButton();
//        basePage.clickPersonalProfileButton();
//        personalProfilePage.clickEditButton();
//    }

    @Test
    public void TC_P_01_UserSuccessfullyUpdatePersonalProfileInformation_When_AllRequiredFieldsAreFilledWithValidInformation() {
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
        loginPage.authenticate(DataConstants.ADMIN_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        basePage.clickPersonalProfileButton();
        personalProfilePage.clickEditButton();
        personalProfilePage.scrollDownToPersonalProfileSection();
        personalProfilePage.fillFirstNameField(DataConstants.FIRST_NAME);
        personalProfilePage.fillLastNameField(DataConstants.LAST_NAME);
        personalProfilePage.fillBirthdayField(DataConstants.BIRTH_DATE_DATE, DataConstants.BIRTH_DATE_MONTH, DataConstants.BIRTH_DATE_YEAR);
        personalProfilePage.fillDescriptionField(DataConstants.PROFILE_DESCRIPTION);
        personalProfilePage.clickUpdateMyProfile();
        actions.waitForElementVisible("personalProfilePage.personalProfileSection.firstName", 30);
        actions.assertElementAttribute("personalProfilePage.personalProfileSection.firstName", "value", DataConstants.FIRST_NAME);
        actions.assertElementAttribute("personalProfilePage.personalProfileSection.lastName", "value", DataConstants.LAST_NAME);
        actions.assertElementAttribute("personalProfilePage.personalProfileSection.birthday", "value", DataConstants.BIRTH_DATE_YEAR + "-" + DataConstants.BIRTH_DATE_MONTH + "-" + DataConstants.BIRTH_DATE_DATE);
        actions.assertValue("personalProfilePage.personalProfileSection.description", DataConstants.PROFILE_DESCRIPTION);
    }

    @Test
    public void TC_P_02_UserSuccessfullyUpdatesWorkplace_When_ItIsSelectedFromDropdownMenu() {
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
        loginPage.authenticate(DataConstants.ADMIN_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        basePage.clickPersonalProfileButton();
        personalProfilePage.clickEditButton();
        personalProfilePage.scrollDownToIndustrySection();
        personalProfilePage.chooseIndustryFromDropdownMenu(DataConstants.PROFESSION);
        personalProfilePage.clickUpdateIndustryButton();
        actions.waitForElementVisibleUntilTimeout("personalProfilePage.profession", 30);
        actions.assertValue("personalProfilePage.profession", DataConstants.PROFESSION.toUpperCase(Locale.ROOT));
    }

    @Test
    public void TC_P_03_UserSuccessfullyUpdatesServices_When_ItProvidesInformation() throws InterruptedException {
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
        loginPage.authenticate(DataConstants.ADMIN_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        basePage.clickPersonalProfileButton();
        personalProfilePage.clickEditButton();

        personalProfilePage.scrollDownToServicesSection();
        personalProfilePage.fillServiceField("personalProfilePage.servicesSection.service1", DataConstants.SERVICE_1);
        personalProfilePage.fillServiceField("personalProfilePage.servicesSection.service2", DataConstants.SERVICE_2);
        personalProfilePage.fillServiceField("personalProfilePage.servicesSection.service3", DataConstants.SERVICE_3);
        personalProfilePage.fillServiceField("personalProfilePage.servicesSection.service4", DataConstants.SERVICE_4);
        personalProfilePage.fillServiceField("personalProfilePage.servicesSection.service5", DataConstants.SERVICE_5);
        personalProfilePage.enterWeeklyAvailability();
        personalProfilePage.clickUpdateServiceButton();
        actions.waitForElementVisible("page.header", 30);
        actions.scrollDownUntilElementVisible("personalProfilePage.latestActivitySection");
        actions.waitForElementVisible("personalProfilePage.latestActivitySection.service1", 1);
        actions.assertValue("personalProfilePage.latestActivitySection.service1", DataConstants.SERVICE_1);
        actions.assertValue("personalProfilePage.latestActivitySection.service2", DataConstants.SERVICE_2);
        actions.assertValue("personalProfilePage.latestActivitySection.service3", DataConstants.SERVICE_3);
        actions.assertValue("personalProfilePage.latestActivitySection.service4", DataConstants.SERVICE_4);
        actions.assertValue("personalProfilePage.latestActivitySection.service5", DataConstants.SERVICE_5);
        actions.assertValue("personalProfilePage.latestActivitySection.weeklyAvailability", "20.0 hours/weekly");
    }
    @Test
    public void TC_P_01_SecondUserSuccessfullyUpdatePersonalProfileInformation_When_AllRequiredFieldsAreFilledWithValidInformation() {
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
        loginPage.authenticate(DataConstants.SECOND_REGULAR_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        basePage.clickPersonalProfileButton();
        personalProfilePage.clickEditButton();
        personalProfilePage.scrollDownToPersonalProfileSection();
        personalProfilePage.fillFirstNameField(DataConstants.SECOND_USER_FIRST_NAME);
        personalProfilePage.fillLastNameField(DataConstants.SECOND_USER_LAST_NAME);
        personalProfilePage.fillBirthdayField(DataConstants.BIRTH_DATE_DATE, DataConstants.BIRTH_DATE_MONTH, DataConstants.BIRTH_DATE_YEAR);
        personalProfilePage.fillDescriptionField(DataConstants.SECOND_PROFILE_DESCRIPTION);
        personalProfilePage.clickUpdateMyProfile();
        actions.waitForElementVisible("personalProfilePage.personalProfileSection.firstName", 30);
        actions.assertElementAttribute("personalProfilePage.personalProfileSection.firstName", "value", DataConstants.SECOND_USER_FIRST_NAME);
        actions.assertElementAttribute("personalProfilePage.personalProfileSection.lastName", "value", DataConstants.SECOND_USER_LAST_NAME);
        actions.assertElementAttribute("personalProfilePage.personalProfileSection.birthday", "value", DataConstants.BIRTH_DATE_YEAR + "-" + DataConstants.BIRTH_DATE_MONTH + "-" + DataConstants.BIRTH_DATE_DATE);
        actions.assertValue("personalProfilePage.personalProfileSection.description", DataConstants.SECOND_PROFILE_DESCRIPTION);
    }

}

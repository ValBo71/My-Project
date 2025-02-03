package pages;

import com.telerikacademy.testframework.Utils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.Select;

public class PersonalProfilePage extends BasePage {

    public PersonalProfilePage(WebDriver driver) {
        super(driver, "baseUrl");
    }


    public void clickEditButton() {
        actions.waitForElementVisibleUntilTimeout("personalProfilePage.editButton", 30);
        actions.clickElement("personalProfilePage.editButton");
    }

    public void scrollDownToPersonalProfileSection() {
        actions.scrollDownUntilElementVisible("personalProfilePage.personalProfileSection");
    }

    public void fillFirstNameField(String fistName) {
        actions.waitForElementVisibleUntilTimeout("personalProfilePage.personalProfileSection.firstName", 30);
        actions.typeValueInField(fistName, "personalProfilePage.personalProfileSection.firstName");
    }

    public void fillLastNameField(String lastName) {
        actions.waitForElementVisibleUntilTimeout("personalProfilePage.personalProfileSection.lastName", 30);
        actions.typeValueInField(lastName, "personalProfilePage.personalProfileSection.lastName");
    }

    public void fillBirthdayField(String date, String month, String year) {
        String birthDate = date + month + year;
        actions.typeValueInField(birthDate, "personalProfilePage.personalProfileSection.birthday");
    }

    public void fillDescriptionField(String description) {
        actions.waitForElementVisibleUntilTimeout("personalProfilePage.personalProfileSection.description", 30);
        actions.typeValueInField(description, "personalProfilePage.personalProfileSection.description");
    }

    public void clickUpdateMyProfile() {
        actions.scrollDownUntilElementVisible("personalProfilePage.personalProfileSection.updateMyProfileButton");
        actions.clickElement("personalProfilePage.personalProfileSection.updateMyProfileButton");
    }

    public void scrollDownToIndustrySection() {
        actions.scrollDownUntilElementVisible("personalProfilePage.industrySection");
    }

    public void chooseIndustryFromDropdownMenu(String industry) {
        Select postVisibility = new Select(driver.findElement(By.xpath(Utils.getUIMappingByKey("personalProfilePage.industrySection.professionalCategoryDropdown"))));
        postVisibility.selectByVisibleText(industry);
    }

    public void clickUpdateIndustryButton() {
        actions.waitForElementVisibleUntilTimeout("personaProfilePage.industrySection.updateButton", 30);
        actions.clickElement("personaProfilePage.industrySection.updateButton");
    }

    public void scrollDownToServicesSection() {
        actions.scrollDownUntilElementVisible("personalProfilePage.servicesSection");
    }

    public void fillServiceField(String locator, String value) {
        actions.waitForElementPresentUntilTimeout(locator, 30);
        actions.typeValueInField(value, locator);
    }

    public void enterWeeklyAvailability() {
        actions.typeValueInField("2", "personalProfilePage.servicesSection.weeklyAvailability");
    }

    public void clickUpdateServiceButton() {
        actions.waitForElementVisibleUntilTimeout("personalProfilePage.servicesSection.updateButton", 30);
        actions.clickElement("personalProfilePage.servicesSection.updateButton");
    }

    public void clickNewFriendRequestButton() {
        actions.clickElement("personalProfilePage.friendRequest");
    }

    public void approveRequest() {
        actions.clickElement("personalProfilePage.friendRequest.approveRequest");
    }

    public void clickDisableButton() {
        actions.waitForElementVisibleUntilTimeout("adminPage.viewUsers.user.disable/enableButton", 30);
        actions.clickElement("adminPage.viewUsers.user.disable/enableButton");
    }

    public void clickEnableButton() {
        actions.waitForElementVisibleUntilTimeout("adminPage.viewUsers.user.disable/enableButton", 30);
        actions.clickElement("adminPage.viewUsers.user.disable/enableButton");
    }

    public void clickConnectButton() {
        actions.clickElement("friendRequest.connectButton");
    }

    public void clickDisconnectButton() {
        actions.clickElement("friendRequest.disconnectButton");
    }
}

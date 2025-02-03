package testCases;
import org.junit.*;

public class A_RegistrationTests extends BaseTest {

    @Before
    public void navigateToRegisterPage() {
        basePage.clickRegisterLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.REGISTRATION_PAGE_HEADER);
    }

    @Test
    public void TC_R_01_UserAccountSuccessfullyCreated_When_ValidValuesAreProvided() {
        registrationPage.fillUsernameField(DataConstants.REGULAR_USERNAME);
        registrationPage.fillEmailField(DataConstants.EMAIL);
        registrationPage.fillPasswordField(DataConstants.PASSWORD);
        registrationPage.fillConfirmationPasswordField(DataConstants.CONFIRMATION_PASSWORD);
        registrationPage.clickRegisterButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.SUCCESSFUL_REGISTRATION_TEXT);
    }

    @Test
    public void TC_R_01_SecondUserAccountSuccessfullyCreated_When_ValidValuesAreProvided() {
        registrationPage.fillUsernameField(DataConstants.SECOND_REGULAR_USERNAME);
        registrationPage.fillEmailField(DataConstants.SECOND_EMAIL);
        registrationPage.fillPasswordField(DataConstants.PASSWORD);
        registrationPage.fillConfirmationPasswordField(DataConstants.CONFIRMATION_PASSWORD);
        registrationPage.clickRegisterButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.SUCCESSFUL_REGISTRATION_TEXT);
    }

    @Test
    public void TC_R_01_UserAccountSuccessfullyCreatedAsAdmin_When_RequiredFieldsFilledWithValidData() {
        registrationPage.fillUsernameField(DataConstants.ADMIN_USERNAME);
        registrationPage.fillEmailField(DataConstants.EMAIL);
        registrationPage.fillPasswordField(DataConstants.PASSWORD);
        registrationPage.fillConfirmationPasswordField(DataConstants.CONFIRMATION_PASSWORD);
        registrationPage.clickRegisterButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.SUCCESSFUL_REGISTRATION_TEXT);
    }

}

import { Page, Locator } from '@playwright/test';

export class LoginLocators {
    readonly title: Locator;
    readonly subtitle: Locator;
    readonly formContainer: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly passwordVisibilityToggleBtn: Locator;
    readonly submitBtn: Locator;
    readonly errorMessageAlert: Locator;
    readonly errorMessageText: Locator;

    constructor(private readonly page: Page) {
        this.title = this.page.getByRole('heading', {
            name: 'Log in to Purchase Module',
        });
        this.subtitle = this.page.locator('.ibm-subtitle');
        this.formContainer = this.page.locator('.ibm-form-container');
        this.usernameInput = this.page.getByLabel('Username');
        this.passwordInput = this.page.getByLabel('Password');
        this.passwordVisibilityToggleBtn = this.page.locator(
            'button:has([data-testid="VisibilityIcon"])'
        );
        this.submitBtn = this.page.getByRole('button', {
            name: 'Continue',
        });
        this.errorMessageAlert = this.page.getByRole('alert');
        this.errorMessageText = this.page.locator('.MuiAlert-message');
    }
}

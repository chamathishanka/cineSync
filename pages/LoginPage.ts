import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // No real <label> elements exist in the DOM (just styled divs), so
  // getByLabel/getByRole can't resolve these — id is the stable fallback.
  readonly accessCodeInput = this.page.locator('#accessCode');
  readonly licenseCodeInput = this.page.locator('#licenceCode');
  readonly continueButton = this.page.getByRole('button', { name: 'Continue' });

  readonly usernameInput = this.page.locator('#username');
  readonly passwordInput = this.page.locator('#password');
  readonly connectButton = this.page.getByRole('button', { name: 'Connect' });

  constructor(page: Page) {
    super(page);
  }

  async enterDeviceCodes(accessCode: string, licenseCode: string) {
    await this.accessCodeInput.fill(accessCode);
    await this.licenseCodeInput.fill(licenseCode);
    await this.continueButton.click();
  }

  async enterCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.connectButton.click();
  }

  async login(accessCode: string, licenseCode: string, username: string, password: string) {
    await this.enterDeviceCodes(accessCode, licenseCode);
    await this.enterCredentials(username, password);
  }
}

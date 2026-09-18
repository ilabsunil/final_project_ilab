import { testdata } from '../config/config-loader';
import { BasePage } from './base.page';
export class DashboardPage extends BasePage {
  public async expectServices(): Promise<void> { await this.expectText('DASH_SERVICES_HEADING', testdata.get('DASH_SERVICES_HEADING_TEXT'), 'Dashboard services heading'); await this.expectCount('DASH_SERVICE_CARDS', testdata.getNumber('DASH_EXPECTED_SERVICE_COUNT'), 'Dashboard service cards'); }
  public async expectService(label: string): Promise<void> { await this.expectVisible('DASH_SERVICE_CARD_BY_NAME', `${label} service card`, { label }); }
}

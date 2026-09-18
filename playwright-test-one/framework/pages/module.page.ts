import { testdata } from '../config/config-loader';
import { BasePage } from './base.page';
export class ModulePage extends BasePage {
  public async header(prefix: string): Promise<void> { await this.expectText('PAGE_TITLE_H1', testdata.get(`${prefix}_PAGE_TITLE`), `${prefix} title`); await this.expectText('PAGE_SUBTITLE', testdata.get(`${prefix}_PAGE_SUBTITLE`), `${prefix} subtitle`); }
  public async rows(prefix: string): Promise<void> { if (testdata.has(`${prefix}_EXPECTED_ROW_COUNT`)) await this.expectCount('LIST_SERVICE_ROWS', testdata.getNumber(`${prefix}_EXPECTED_ROW_COUNT`), `${prefix} rows`); else await this.expectMinCount('LIST_SERVICE_ROWS', testdata.getNumber(`${prefix}_MIN_ROW_COUNT`), `${prefix} rows`); for (let i = 1; testdata.has(`${prefix}_EXPECTED_ROW_${i}`); i += 1) await this.expectVisible('LIST_SERVICE_ROW_BY_TITLE', `${prefix} row`, { label: testdata.get(`${prefix}_EXPECTED_ROW_${i}`) }); }
  public async action(prefix: string): Promise<void> { await this.expectText('PAGE_PRIMARY_ACTION_BUTTON', testdata.get(`${prefix}_ACTION_LABEL`), `${prefix} action`); }
  public async expectRowTitle(title: string): Promise<void> { await this.expectVisible('LIST_SERVICE_ROW_BY_TITLE', `Row "${title}"`, { label: title }); }
  public async clickAction(key: string, label: string): Promise<void> { await this.click(key, label); }
}

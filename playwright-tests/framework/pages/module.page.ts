// Reusable page object for every list-style banking module (Loans, Credit Cards,
// Statements, Activity History, Preferences). Pass the testdata key PREFIX (e.g. "LOANS")
// and it reads <PREFIX>_PAGE_TITLE, <PREFIX>_PAGE_SUBTITLE, <PREFIX>_ACTION_LABEL,
// <PREFIX>_EXPECTED_ROW_COUNT / <PREFIX>_MIN_ROW_COUNT and <PREFIX>_EXPECTED_ROW_n.
// Adding a new module = add its rows to testdata.properties, no new page class needed.
import { testdata } from '../config/config-loader';
import { BasePage } from './base.page';

export class ModulePage extends BasePage {
  // Confirm the module heading and subtitle for the given data-key prefix.
  public async expectHeader(prefix: string): Promise<void> {
    await this.expectText('PAGE_TITLE_H1', testdata.get(`${prefix}_PAGE_TITLE`), `${prefix} page title`);
    await this.expectText('PAGE_SUBTITLE', testdata.get(`${prefix}_PAGE_SUBTITLE`), `${prefix} page subtitle`);
  }

  // Confirm the module's primary action button (e.g. "Apply for a loan") is present.
  public async expectPrimaryAction(prefix: string): Promise<void> {
    await this.expectText('PAGE_PRIMARY_ACTION_BUTTON', testdata.get(`${prefix}_ACTION_LABEL`), `${prefix} primary action`);
  }

  // Confirm the list row count (exact if <PREFIX>_EXPECTED_ROW_COUNT, else minimum).
  public async expectRows(prefix: string): Promise<void> {
    if (testdata.has(`${prefix}_EXPECTED_ROW_COUNT`)) {
      await this.expectCount('LIST_SERVICE_ROWS', testdata.getNumber(`${prefix}_EXPECTED_ROW_COUNT`), `${prefix} list rows`);
    } else {
      await this.expectMinCount('LIST_SERVICE_ROWS', testdata.getNumber(`${prefix}_MIN_ROW_COUNT`), `${prefix} list rows`);
    }
  }

  // Confirm each <PREFIX>_EXPECTED_ROW_n title is present in the list.
  public async expectRowTitles(prefix: string): Promise<void> {
    for (let i = 1; testdata.has(`${prefix}_EXPECTED_ROW_${i}`); i += 1) {
      const title = testdata.get(`${prefix}_EXPECTED_ROW_${i}`);
      await this.expectVisible('LIST_SERVICE_ROW_BY_TITLE', `${prefix} row "${title}"`, { label: title });
    }
  }

  // Open (click) the first row in the list.
  public async openFirstRow(prefix: string): Promise<string> {
    const title = await this.textOf('LIST_SERVICE_ROW_TITLES');
    await this.click('LIST_SERVICE_ROWS', `${prefix} first row "${title}"`);
    return title;
  }

  // Click the module's primary action button.
  public async clickPrimaryAction(prefix: string): Promise<void> {
    await this.click('PAGE_PRIMARY_ACTION_BUTTON', `${prefix} "${testdata.get(`${prefix}_ACTION_LABEL`)}" button`);
  }
}

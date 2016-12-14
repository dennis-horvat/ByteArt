import { Check!Page } from './app.po';

describe('check! App', function() {
  let page: Check!Page;

  beforeEach(() => {
    page = new Check!Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

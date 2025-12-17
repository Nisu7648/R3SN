/**
 * Xero API Integration
 * Complete accounting and financial management
 */

const axios = require('axios');

class XeroAPI {
  constructor(accessToken, tenantId) {
    this.accessToken = accessToken || process.env.XERO_ACCESS_TOKEN;
    this.tenantId = tenantId || process.env.XERO_TENANT_ID;
    this.baseURL = 'https://api.xero.com/api.xro/2.0';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'xero-tenant-id': this.tenantId,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // ==================== INVOICES ====================

  async createInvoice(data) {
    const payload = { Invoices: [data] };
    const response = await this.client.post('/Invoices', payload);
    return { success: true, invoice: response.data.Invoices[0] };
  }

  async getInvoice(invoiceId) {
    const response = await this.client.get(`/Invoices/${invoiceId}`);
    return { success: true, invoice: response.data.Invoices[0] };
  }

  async updateInvoice(invoiceId, data) {
    const payload = { Invoices: [{ InvoiceID: invoiceId, ...data }] };
    const response = await this.client.post('/Invoices', payload);
    return { success: true, invoice: response.data.Invoices[0] };
  }

  async listInvoices(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order }),
      ...(options.page && { page: options.page }),
      ...(options.includeArchived && { includeArchived: options.includeArchived })
    };

    const response = await this.client.get('/Invoices', { params });
    return { success: true, invoices: response.data.Invoices };
  }

  async deleteInvoice(invoiceId) {
    const payload = { Invoices: [{ InvoiceID: invoiceId, Status: 'DELETED' }] };
    const response = await this.client.post('/Invoices', payload);
    return { success: true, invoice: response.data.Invoices[0] };
  }

  async emailInvoice(invoiceId) {
    await this.client.post(`/Invoices/${invoiceId}/Email`);
    return { success: true, message: 'Invoice emailed successfully' };
  }

  // ==================== CONTACTS ====================

  async createContact(data) {
    const payload = { Contacts: [data] };
    const response = await this.client.post('/Contacts', payload);
    return { success: true, contact: response.data.Contacts[0] };
  }

  async getContact(contactId) {
    const response = await this.client.get(`/Contacts/${contactId}`);
    return { success: true, contact: response.data.Contacts[0] };
  }

  async updateContact(contactId, data) {
    const payload = { Contacts: [{ ContactID: contactId, ...data }] };
    const response = await this.client.post('/Contacts', payload);
    return { success: true, contact: response.data.Contacts[0] };
  }

  async listContacts(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order }),
      ...(options.page && { page: options.page }),
      ...(options.includeArchived && { includeArchived: options.includeArchived })
    };

    const response = await this.client.get('/Contacts', { params });
    return { success: true, contacts: response.data.Contacts };
  }

  async deleteContact(contactId) {
    const payload = { Contacts: [{ ContactID: contactId, ContactStatus: 'ARCHIVED' }] };
    const response = await this.client.post('/Contacts', payload);
    return { success: true, contact: response.data.Contacts[0] };
  }

  // ==================== ACCOUNTS ====================

  async createAccount(data) {
    const payload = { Accounts: [data] };
    const response = await this.client.post('/Accounts', payload);
    return { success: true, account: response.data.Accounts[0] };
  }

  async getAccount(accountId) {
    const response = await this.client.get(`/Accounts/${accountId}`);
    return { success: true, account: response.data.Accounts[0] };
  }

  async updateAccount(accountId, data) {
    const payload = { Accounts: [{ AccountID: accountId, ...data }] };
    const response = await this.client.post('/Accounts', payload);
    return { success: true, account: response.data.Accounts[0] };
  }

  async listAccounts(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order })
    };

    const response = await this.client.get('/Accounts', { params });
    return { success: true, accounts: response.data.Accounts };
  }

  async deleteAccount(accountId) {
    const payload = { Accounts: [{ AccountID: accountId, Status: 'ARCHIVED' }] };
    const response = await this.client.post('/Accounts', payload);
    return { success: true, account: response.data.Accounts[0] };
  }

  // ==================== BANK TRANSACTIONS ====================

  async createBankTransaction(data) {
    const payload = { BankTransactions: [data] };
    const response = await this.client.post('/BankTransactions', payload);
    return { success: true, transaction: response.data.BankTransactions[0] };
  }

  async getBankTransaction(transactionId) {
    const response = await this.client.get(`/BankTransactions/${transactionId}`);
    return { success: true, transaction: response.data.BankTransactions[0] };
  }

  async updateBankTransaction(transactionId, data) {
    const payload = { BankTransactions: [{ BankTransactionID: transactionId, ...data }] };
    const response = await this.client.post('/BankTransactions', payload);
    return { success: true, transaction: response.data.BankTransactions[0] };
  }

  async listBankTransactions(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order }),
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/BankTransactions', { params });
    return { success: true, transactions: response.data.BankTransactions };
  }

  async deleteBankTransaction(transactionId) {
    const payload = { BankTransactions: [{ BankTransactionID: transactionId, Status: 'DELETED' }] };
    const response = await this.client.post('/BankTransactions', payload);
    return { success: true, transaction: response.data.BankTransactions[0] };
  }

  // ==================== PAYMENTS ====================

  async createPayment(data) {
    const payload = { Payments: [data] };
    const response = await this.client.post('/Payments', payload);
    return { success: true, payment: response.data.Payments[0] };
  }

  async getPayment(paymentId) {
    const response = await this.client.get(`/Payments/${paymentId}`);
    return { success: true, payment: response.data.Payments[0] };
  }

  async listPayments(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order }),
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/Payments', { params });
    return { success: true, payments: response.data.Payments };
  }

  async deletePayment(paymentId) {
    const payload = { Payments: [{ PaymentID: paymentId, Status: 'DELETED' }] };
    const response = await this.client.post('/Payments', payload);
    return { success: true, payment: response.data.Payments[0] };
  }

  // ==================== CREDIT NOTES ====================

  async createCreditNote(data) {
    const payload = { CreditNotes: [data] };
    const response = await this.client.post('/CreditNotes', payload);
    return { success: true, creditNote: response.data.CreditNotes[0] };
  }

  async getCreditNote(creditNoteId) {
    const response = await this.client.get(`/CreditNotes/${creditNoteId}`);
    return { success: true, creditNote: response.data.CreditNotes[0] };
  }

  async updateCreditNote(creditNoteId, data) {
    const payload = { CreditNotes: [{ CreditNoteID: creditNoteId, ...data }] };
    const response = await this.client.post('/CreditNotes', payload);
    return { success: true, creditNote: response.data.CreditNotes[0] };
  }

  async listCreditNotes(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order }),
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/CreditNotes', { params });
    return { success: true, creditNotes: response.data.CreditNotes };
  }

  // ==================== PURCHASE ORDERS ====================

  async createPurchaseOrder(data) {
    const payload = { PurchaseOrders: [data] };
    const response = await this.client.post('/PurchaseOrders', payload);
    return { success: true, purchaseOrder: response.data.PurchaseOrders[0] };
  }

  async getPurchaseOrder(purchaseOrderId) {
    const response = await this.client.get(`/PurchaseOrders/${purchaseOrderId}`);
    return { success: true, purchaseOrder: response.data.PurchaseOrders[0] };
  }

  async updatePurchaseOrder(purchaseOrderId, data) {
    const payload = { PurchaseOrders: [{ PurchaseOrderID: purchaseOrderId, ...data }] };
    const response = await this.client.post('/PurchaseOrders', payload);
    return { success: true, purchaseOrder: response.data.PurchaseOrders[0] };
  }

  async listPurchaseOrders(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order }),
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/PurchaseOrders', { params });
    return { success: true, purchaseOrders: response.data.PurchaseOrders };
  }

  async deletePurchaseOrder(purchaseOrderId) {
    const payload = { PurchaseOrders: [{ PurchaseOrderID: purchaseOrderId, Status: 'DELETED' }] };
    const response = await this.client.post('/PurchaseOrders', payload);
    return { success: true, purchaseOrder: response.data.PurchaseOrders[0] };
  }

  // ==================== ITEMS ====================

  async createItem(data) {
    const payload = { Items: [data] };
    const response = await this.client.post('/Items', payload);
    return { success: true, item: response.data.Items[0] };
  }

  async getItem(itemId) {
    const response = await this.client.get(`/Items/${itemId}`);
    return { success: true, item: response.data.Items[0] };
  }

  async updateItem(itemId, data) {
    const payload = { Items: [{ ItemID: itemId, ...data }] };
    const response = await this.client.post('/Items', payload);
    return { success: true, item: response.data.Items[0] };
  }

  async listItems(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order })
    };

    const response = await this.client.get('/Items', { params });
    return { success: true, items: response.data.Items };
  }

  async deleteItem(itemId) {
    const payload = { Items: [{ ItemID: itemId, IsArchived: true }] };
    const response = await this.client.post('/Items', payload);
    return { success: true, item: response.data.Items[0] };
  }

  // ==================== QUOTES ====================

  async createQuote(data) {
    const payload = { Quotes: [data] };
    const response = await this.client.post('/Quotes', payload);
    return { success: true, quote: response.data.Quotes[0] };
  }

  async getQuote(quoteId) {
    const response = await this.client.get(`/Quotes/${quoteId}`);
    return { success: true, quote: response.data.Quotes[0] };
  }

  async updateQuote(quoteId, data) {
    const payload = { Quotes: [{ QuoteID: quoteId, ...data }] };
    const response = await this.client.post('/Quotes', payload);
    return { success: true, quote: response.data.Quotes[0] };
  }

  async listQuotes(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order }),
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/Quotes', { params });
    return { success: true, quotes: response.data.Quotes };
  }

  // ==================== EMPLOYEES ====================

  async createEmployee(data) {
    const payload = { Employees: [data] };
    const response = await this.client.post('/Employees', payload);
    return { success: true, employee: response.data.Employees[0] };
  }

  async getEmployee(employeeId) {
    const response = await this.client.get(`/Employees/${employeeId}`);
    return { success: true, employee: response.data.Employees[0] };
  }

  async updateEmployee(employeeId, data) {
    const payload = { Employees: [{ EmployeeID: employeeId, ...data }] };
    const response = await this.client.post('/Employees', payload);
    return { success: true, employee: response.data.Employees[0] };
  }

  async listEmployees(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order })
    };

    const response = await this.client.get('/Employees', { params });
    return { success: true, employees: response.data.Employees };
  }

  // ==================== TAX RATES ====================

  async createTaxRate(data) {
    const payload = { TaxRates: [data] };
    const response = await this.client.post('/TaxRates', payload);
    return { success: true, taxRate: response.data.TaxRates[0] };
  }

  async getTaxRate(taxType) {
    const response = await this.client.get(`/TaxRates?where=TaxType=="${taxType}"`);
    return { success: true, taxRate: response.data.TaxRates[0] };
  }

  async updateTaxRate(data) {
    const payload = { TaxRates: [data] };
    const response = await this.client.post('/TaxRates', payload);
    return { success: true, taxRate: response.data.TaxRates[0] };
  }

  async listTaxRates(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.order && { order: options.order })
    };

    const response = await this.client.get('/TaxRates', { params });
    return { success: true, taxRates: response.data.TaxRates };
  }

  // ==================== TRACKING CATEGORIES ====================

  async createTrackingCategory(data) {
    const payload = { TrackingCategories: [data] };
    const response = await this.client.post('/TrackingCategories', payload);
    return { success: true, trackingCategory: response.data.TrackingCategories[0] };
  }

  async getTrackingCategory(trackingCategoryId) {
    const response = await this.client.get(`/TrackingCategories/${trackingCategoryId}`);
    return { success: true, trackingCategory: response.data.TrackingCategories[0] };
  }

  async updateTrackingCategory(trackingCategoryId, data) {
    const payload = { TrackingCategories: [{ TrackingCategoryID: trackingCategoryId, ...data }] };
    const response = await this.client.post('/TrackingCategories', payload);
    return { success: true, trackingCategory: response.data.TrackingCategories[0] };
  }

  async listTrackingCategories(options = {}) {
    const params = {
      ...(options.where && { where: options.where }),
      ...(options.includeArchived && { includeArchived: options.includeArchived })
    };

    const response = await this.client.get('/TrackingCategories', { params });
    return { success: true, trackingCategories: response.data.TrackingCategories };
  }

  async deleteTrackingCategory(trackingCategoryId) {
    const payload = { TrackingCategories: [{ TrackingCategoryID: trackingCategoryId, Status: 'ARCHIVED' }] };
    const response = await this.client.post('/TrackingCategories', payload);
    return { success: true, trackingCategory: response.data.TrackingCategories[0] };
  }

  // ==================== REPORTS ====================

  async getBalanceSheet(options = {}) {
    const params = {
      ...(options.date && { date: options.date }),
      ...(options.periods && { periods: options.periods }),
      ...(options.timeframe && { timeframe: options.timeframe }),
      ...(options.trackingOptionID1 && { trackingOptionID1: options.trackingOptionID1 }),
      ...(options.trackingOptionID2 && { trackingOptionID2: options.trackingOptionID2 }),
      ...(options.standardLayout && { standardLayout: options.standardLayout }),
      ...(options.paymentsOnly && { paymentsOnly: options.paymentsOnly })
    };

    const response = await this.client.get('/Reports/BalanceSheet', { params });
    return { success: true, report: response.data.Reports[0] };
  }

  async getProfitAndLoss(options = {}) {
    const params = {
      ...(options.fromDate && { fromDate: options.fromDate }),
      ...(options.toDate && { toDate: options.toDate }),
      ...(options.periods && { periods: options.periods }),
      ...(options.timeframe && { timeframe: options.timeframe }),
      ...(options.trackingCategoryID && { trackingCategoryID: options.trackingCategoryID }),
      ...(options.trackingOptionID && { trackingOptionID: options.trackingOptionID }),
      ...(options.standardLayout && { standardLayout: options.standardLayout }),
      ...(options.paymentsOnly && { paymentsOnly: options.paymentsOnly })
    };

    const response = await this.client.get('/Reports/ProfitAndLoss', { params });
    return { success: true, report: response.data.Reports[0] };
  }

  async getTrialBalance(options = {}) {
    const params = {
      ...(options.date && { date: options.date }),
      ...(options.paymentsOnly && { paymentsOnly: options.paymentsOnly })
    };

    const response = await this.client.get('/Reports/TrialBalance', { params });
    return { success: true, report: response.data.Reports[0] };
  }

  async getBankSummary(options = {}) {
    const params = {
      ...(options.fromDate && { fromDate: options.fromDate }),
      ...(options.toDate && { toDate: options.toDate })
    };

    const response = await this.client.get('/Reports/BankSummary', { params });
    return { success: true, report: response.data.Reports[0] };
  }

  async getAgedReceivables(options = {}) {
    const params = {
      ...(options.date && { date: options.date }),
      ...(options.fromDate && { fromDate: options.fromDate }),
      ...(options.toDate && { toDate: options.toDate })
    };

    const response = await this.client.get('/Reports/AgedReceivablesByContact', { params });
    return { success: true, report: response.data.Reports[0] };
  }

  async getAgedPayables(options = {}) {
    const params = {
      ...(options.date && { date: options.date }),
      ...(options.fromDate && { fromDate: options.fromDate }),
      ...(options.toDate && { toDate: options.toDate })
    };

    const response = await this.client.get('/Reports/AgedPayablesByContact', { params });
    return { success: true, report: response.data.Reports[0] };
  }

  // ==================== ORGANISATION ====================

  async getOrganisation() {
    const response = await this.client.get('/Organisation');
    return { success: true, organisation: response.data.Organisations[0] };
  }

  // ==================== USERS ====================

  async listUsers() {
    const response = await this.client.get('/Users');
    return { success: true, users: response.data.Users };
  }

  async getUser(userId) {
    const response = await this.client.get(`/Users/${userId}`);
    return { success: true, user: response.data.Users[0] };
  }

  // ==================== CURRENCIES ====================

  async listCurrencies() {
    const response = await this.client.get('/Currencies');
    return { success: true, currencies: response.data.Currencies };
  }

  // ==================== BRANDING THEMES ====================

  async listBrandingThemes() {
    const response = await this.client.get('/BrandingThemes');
    return { success: true, brandingThemes: response.data.BrandingThemes };
  }

  async getBrandingTheme(brandingThemeId) {
    const response = await this.client.get(`/BrandingThemes/${brandingThemeId}`);
    return { success: true, brandingTheme: response.data.BrandingThemes[0] };
  }
}

module.exports = XeroAPI;

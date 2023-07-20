/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import {ROUTES_PATH} from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import { bills } from "../fixtures/bills";
import {ROUTES} from "../constants/routes";
import userEvent from "@testing-library/user-event";
import store from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill", () => {
   test("Then add a file with incorrect format will disable button", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Empolyee', email: 'a@a'
    }))
     document.body.innerHTML = NewBillUI()
     const newBill = new NewBill({
      document, onNavigate, store: store, localStorage: window.localStorage
     })
     const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
     const newfile = new File(['hello'], 'hello.svg', {type: 'image/svg'})
     userEvent.upload(screen.getByTestId("file"), newfile)
     const errorMessage = screen.getByTestId('error_message')
     const sendBtn = screen.getByRole("button");
     expect(screen.getByTestId("file").files).toHaveLength(1)
     expect(errorMessage).toBeDefined()
     expect(sendBtn).toHaveProperty('disabled', true);
   })
   test("Then add a file with correct format will not disable button", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Empolyee', email: 'a@a'
    }))
     document.body.innerHTML = NewBillUI()
     const newBill = new NewBill({
      document, onNavigate, store: store, localStorage: window.localStorage
     })
     const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
     const newfile = new File(['hello'], 'hello.png', {type: 'image/png'})
     userEvent.upload(screen.getByTestId("file"), newfile)
     const errorMessage = screen.queryByTestId('error_message')
     const sendBtn = screen.getByRole("button");
     expect(screen.getByTestId("file").files).toHaveLength(1)
     expect(errorMessage).toBeNull()
     expect(sendBtn).toHaveProperty('disabled', false);
   })
   test("Then clicking on button when datas are correct will validate the operation", () => {
    const onNavigate = jest.fn();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Empolyee', email: 'a@a'
    }))
     document.body.innerHTML = NewBillUI()
     const newBill = new NewBill({
      document, onNavigate, store: store, localStorage: window.localStorage
     })
     const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
     const newfile = new File(['hello'], 'hello.png', {type: 'image/png'})
     userEvent.upload(screen.getByTestId("file"), newfile)
     const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
     const submit = screen.getByTestId('form-new-bill');
     submit.addEventListener('submit', handleSubmit);
     fireEvent.submit(submit);
     expect(handleSubmit).toHaveBeenCalled();
   })
  }) 
})


// POST
describe('Given I am connected as an employee', () => {
  describe('When I create a new bill', () => {
    test('Add bill to mock API POST', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "azerty@email.com",
        })
      );
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const bill = {
        type: "Transports",
        name: "taxi",
        date: "2023-01-01",
        amount: 200,
        vat: 1,
        pct: 1,
        commentary: "de Paris a Marseille",
        fileUrl: "/ticket.jpg",
        fileName: "ticket.jpg",
        status: "pending",
      };

      screen.getByTestId("expense-type").value = bill.type;
      screen.getByTestId("expense-name").value = bill.name;
      screen.getByTestId("datepicker").value = bill.date;
      screen.getByTestId("amount").value =bill.amount;
      screen.getByTestId("vat").value = bill.vat;
      screen.getByTestId("pct").value = bill.pct;
      screen.getByTestId("commentary").value = bill.commentary;
      newBill.fileName = bill.fileName;
      newBill.fileUrl = bill.fileUrl;

      newBill.updateBill = jest.fn(); 
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e)); 

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
    });
  })
  describe("When an error occurs on POST API", () => {
    beforeEach(() => {
      jest.spyOn(store, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches messages from POST API and fails with error at submit button", async () => {
      store.bills.mockImplementationOnce(() => {
        return {
          update : () =>  {
            return Promise.reject(new Error("Erreur"))
          }
        }})

      window.onNavigate(ROUTES_PATH.NewBill)

      const newBill = new NewBill({document,  onNavigate, store: store, localStorage: window.localStorage})
      console.error = jest.fn();
      
      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)

      fireEvent.submit(form)
      await new Promise(process.nextTick)

      expect(console.error).toBeCalled()
    })
  })
})
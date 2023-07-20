/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import '@testing-library/jest-dom';
import router from "../app/Router.js";
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event";
import store from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(screen.getByTestId('icon-window')).toHaveClass('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const datesSorted = [...dates].sort((a, b) => new Date(b.date) - new Date(a.date))
      expect(dates).toEqual(datesSorted)
    })
    test("Click on icon eye should open a modal with the image", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      
      const allbills = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      
      document.body.innerHTML = BillsUI({ data: bills })
      const icon = screen.getAllByTestId('icon-eye')
      const clickedIcon = icon[0]
      const handleClickIconEye = jest.fn(() => allbills.handleClickIconEye(clickedIcon))
      $.fn.modal = jest.fn();
      clickedIcon.addEventListener('click', handleClickIconEye)
      userEvent.click(clickedIcon)
      expect(handleClickIconEye).toHaveBeenCalled()
    })
  })
  describe("When the new bill button is clicked", () => {
    test("New Bill form should be rendered", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const bills = new Bills({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });
  
      const buttonNewBill = screen.getByRole("button");
      expect(buttonNewBill).toBeTruthy();
      const handleClickNewBill = jest.fn(bills.handleClickNewBill);
      buttonNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(buttonNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });
})

//  test d'intégration GET 
describe("Given I am a user connected as employee",() =>{
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const newBills = new Bills({document, onNavigate, store, localStorage: window.localStorage})
      const getbills = await newBills.getBills()
      expect(getbills.length).toEqual(4)
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(store, "bills");
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {
        store.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})

          document.body.innerHTML = BillsUI({ error: 'Erreur 404' })
          const message = screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        store.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

          document.body.innerHTML = BillsUI({ error: 'Erreur 500' })
          const message = screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
      })
    })
  })
})
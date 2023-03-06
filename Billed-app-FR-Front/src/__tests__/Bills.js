/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"

import router from "../app/Router.js"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import store from "../__mocks__/store"
import {bills} from "../fixtures/bills.js"

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then current bills should be displayed", async () => {
            document.body.innerHTML = BillsUI({data: bills})

            const billsList = new Bills({
                document,
                onNavigate: (pathname) => (document.body.innerHTML = ROUTES({pathname})),
                store,
                localStorageMock,
            })

            const billsData = await billsList.getBills()
            expect(billsData.length).toBe(4)
        })
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
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
            expect(windowIcon.className.includes("active-icon")).toBeTruthy()
        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({data: bills})
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
    })
})

describe("When I click on new bills button", () => {
    test("Then I should be navigate to new bill form", () => {
        document.body.innerHTML = BillsUI({ data: bills })

        const billsList = new Bills({
            document,
            onNavigate: (pathname) => (document.body.innerHTML = ROUTES({ pathname })),
            store,
            localStorageMock,
        })

        const newBillsBtn = screen.getByTestId("btn-new-bill")
        const handleClickNewBill = jest.fn(billsList.handleClickNewBill())
        const formPage = screen.getByTestId("form-new-bill")


        newBillsBtn.addEventListener("click", handleClickNewBill)
        userEvent.click(newBillsBtn)

        expect(handleClickNewBill).toHaveBeenCalled()
        expect(formPage).toBeTruthy()
    })
})

describe("When I click on eye icon", () => {
    test("Then I should open the modal", () => {
        document.body.innerHTML = BillsUI({ data: bills });

        const billsList = new Bills({
            document,
            onNavigate: (pathname) => (document.body.innerHTML = ROUTES({ pathname })),
            store,
            localStorageMock,
        });

        $.fn.modal = jest.fn(); //mock the modal

        const eye = screen.getAllByTestId("icon-eye")[0]
        const handleClickIconEye = jest.fn(billsList.handleClickIconEye(eye))
        eye.addEventListener("click", handleClickIconEye)
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()

        const modal = screen.getByTestId("modaleFileEmployee")
        expect(modal).toBeTruthy()
    })
})

describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
        test("fetches bills from mock API GET", async () => {
            const storeSpy = jest.spyOn(store, "bills")
            const userBills = await store.bills().list()
            expect(storeSpy).toHaveBeenCalled()
            expect(userBills.length).toBe(4)
        })

        test("fetches bills from an API and fails with 404 message error", async () => {
            store.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 404"))
                    }
                }
            })

            document.body.innerHTML = BillsUI({error: "Erreur 404"})
            const message = await screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
        })

        test("fetches messages from an API and fails with 500 message error", async () => {

            store.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 500"))
                    }
                }
            })

            document.body.innerHTML = BillsUI({error: "Erreur 500"})
            const message = await screen.getByText(/Erreur 500/)
            expect(message).toBeTruthy()
        })
    })
})





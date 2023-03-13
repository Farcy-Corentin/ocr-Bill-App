/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js"
import mockStore from "../__mocks__/store.js"
import userEvent from "@testing-library/user-event";


describe("Given I am connected as an employee", () => {
    beforeEach(() => {
        Object.defineProperty(window, localStorage, {value: localStorageMock})
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
                email: "a@a",
            })
        )
    })
    describe("When I am on NewBill Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.NewBill)
            await waitFor(() => screen.getByTestId("icon-mail"))
            const mailIcon = screen.getByTestId("icon-mail")
            expect(mailIcon.className.includes("active-icon")).toBeTruthy()
        })
        test("Then the form should be displayed", () => {
            const html = NewBillUI()
            document.body.innerHTML = html
            expect(screen.getByTestId("form-new-bill")).toBeTruthy()
            expect(screen.getByTestId("expense-type")).toBeTruthy()
            expect(screen.getByTestId("expense-name")).toBeTruthy()
            expect(screen.getByTestId("datepicker")).toBeTruthy()
            expect(screen.getByTestId("amount")).toBeTruthy()
            expect(screen.getByTestId("vat")).toBeTruthy()
            expect(screen.getByTestId("pct")).toBeTruthy()
            expect(screen.getByTestId("commentary")).toBeTruthy()
            expect(screen.getByTestId("file")).toBeTruthy()
            expect(screen.getByRole("button")).toBeTruthy()
        })
        describe("When I upload a file", () => {
            beforeEach(() => {
                jest.clearAllMocks()
            })
            afterEach(() => {
                jest.clearAllMocks()
            })
            test("Then I upload a png or jpg/jpeg file", async () => {
                const html = NewBillUI()
                document.body.innerHTML = html
                //to-do write assertion
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({pathname})
                }

                const newBillContainer = new NewBill({
                    document,
                    onNavigate,
                    store: mockStore,
                    localStorage: window.localStorage,
                })

                const handleChangeFile = jest.fn((e) => newBillContainer.handleChangeFile(e))
                const file = screen.getByTestId("file")

                const testFiles = [
                    new File(["image1"], "image.jpg"),
                    new File(["image2"], "image.jpeg"),
                    new File(["image3"], "image.png"),
                ]

                file.addEventListener("change", handleChangeFile)
                for (const testFile of testFiles) {
                    userEvent.upload(file, testFile)
                    await new Promise((resolve) => setTimeout(resolve, 100))
                    expect(file.files[0].name.split(".")[1] === "jpg" || file.files[0].name.split(".")[1] === "jpeg" || file.files[0].name.split(".")[1] === "png").toBe(true)
                }
            })
            test("Then I doesn't upload a valid file", async () => {
                const html = NewBillUI()
                document.body.innerHTML = html
                //to-do write assertion
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({pathname})
                }

                const newBillContainer = new NewBill({
                    document,
                    onNavigate,
                    store: mockStore,
                    localStorage: window.localStorage,
                })

                const handleChangeFile = jest.fn((e) => newBillContainer.handleChangeFile(e))
                const file = screen.getByTestId("file")

                const testFiles = [
                    new File(["image4"], "image.pdf"),
                    new File(["image5"], "image.odt"),
                ]

                file.addEventListener("change", handleChangeFile)
                for (const testFile of testFiles) {
                    userEvent.upload(file, testFile)
                    await new Promise((resolve) => setTimeout(resolve, 100))
                    expect(file.files[0].name.split(".")[1] !== "jpg" || file.files[0].name.split(".")[1] !== "jpeg" || file.files[0].name.split(".")[1] !== "png").toBe(true)
                }

                expect(file.value).toBe("")
            })
            describe("When I submit a completed form", () => {
                test("Then a new bill should be created", async () => {
                    const html = NewBillUI()
                    document.body.innerHTML = html

                    const onNavigate = (pathname) => {
                        document.body.innerHTML = ROUTES({pathname})
                    }

                    Object.defineProperty(window, "localStorage", {value: localStorageMock})
                    window.localStorage.setItem(
                        "user",
                        JSON.stringify({
                            type: "Employee",
                            email: "azerty@email.com",
                        })
                    )

                    const newBill = new NewBill({
                        document,
                        onNavigate,
                        store: mockStore,
                        localStorage: window.localStorage,
                    })

                    const sampleBill = {
                        type: "Hôtel et logement",
                        name: "encore",
                        date: "2004-04-04",
                        amount: 400,
                        vat: 80,
                        pct: 20,
                        commentary: "séminaire billed",
                        fileUrl:
                            "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                        fileName: "preview-facture-free-201801-pdf-1.jpg",
                        status: "pending",
                    }

                    screen.getByTestId("expense-type").value = sampleBill.type
                    screen.getByTestId("expense-name").value = sampleBill.name
                    screen.getByTestId("datepicker").value = sampleBill.date
                    screen.getByTestId("amount").value = sampleBill.amount
                    screen.getByTestId("vat").value = sampleBill.vat
                    screen.getByTestId("pct").value = sampleBill.pct
                    screen.getByTestId("commentary").value = sampleBill.commentary

                    newBill.fileName = sampleBill.fileName
                    newBill.fileUrl = sampleBill.fileUrl

                    newBill.updateBill = jest.fn()
                    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

                    const form = screen.getByTestId("form-new-bill")
                    form.addEventListener("submit", handleSubmit)
                    fireEvent.submit(form)

                    expect(handleSubmit).toHaveBeenCalled()
                    expect(newBill.updateBill).toHaveBeenCalled()
                })
                test("fetches error from an API and fails with 500 error", async () => {
                    jest.spyOn(mockStore, "bills")
                    jest.spyOn(console, "error").mockImplementation(() => {
                    })
                    Object.defineProperty(window, "localStorage", {value: localStorageMock})
                    Object.defineProperty(window, "location", {
                        value: {hash: ROUTES_PATH["NewBill"]},
                    })

                    window.localStorage.setItem("user", JSON.stringify({type: "Employee"}))
                    document.body.innerHTML = `<div id="root"></div>`
                    router()

                    const onNavigate = (pathname) => {
                        document.body.innerHTML = ROUTES({pathname})
                    }

                    mockStore.bills.mockImplementationOnce(() => {
                        return {
                            update: () => {
                                return Promise.reject(new Error("Erreur 500"))
                            },
                        }
                    })
                    const newBill = new NewBill({
                        document,
                        onNavigate,
                        store: mockStore,
                        localStorage: window.localStorage,
                    })

                    const form = screen.getByTestId("form-new-bill")
                    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
                    form.addEventListener("submit", handleSubmit)
                    fireEvent.submit(form)
                    await new Promise(process.nextTick)
                    expect(console.error).toBeCalled()
                })
            })
        })
    })
})

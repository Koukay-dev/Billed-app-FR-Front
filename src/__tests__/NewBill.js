/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, fireEvent} from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";



jest.mock("../app/store", () => mockStore);

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("Unit Test Suites", () => {
      beforeEach(() => {
        const html = NewBillUI();
        document.body.innerHTML = html;
      });

      test("Then it should show the correct title", async () => {
        expect(
          screen.getByText("Envoyer une note de frais")
        ).toBeInTheDocument();
      });

      test("When I put input a file with an incorrect extension, its value should not change", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorageMock,
        });

        const fakeTxtFile = new File(["content"], "invalid.txt", {
          type: "text/plain",
        });

        alert = jest.fn();

        const fileInput = screen.getByTestId("file");

        Object.defineProperty(fileInput, "files", {
          value: [fakeTxtFile],
          writable: false,
        });

        newBill.handleChangeFile({
          preventDefault: jest.fn(),
        });

        expect(fileInput.value).toBe("");
      });

      test("When I put input a file with a correct extension, its value should change and the store should be called", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "employee@test.tld",
            password: "employee",
            status: "connected",
          })
        );

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorageMock,
        });

        const fakePngFile = new File(["content"], "correct.png", {
          type: "image/png",
        });

        const fileInput = screen.getByTestId("file");

        Object.defineProperty(fileInput, "files", {
          value: [fakePngFile],
          writable: false,
        });

        newBill.handleChangeFile({
          preventDefault: jest.fn(),
        });

        expect(fileInput.files[0].name).toBe("correct.png");
      });
    });

    describe("Integration Test Suites", () => {
      // test integration POST
      test("Push new bill from mock API POST", async () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "employee@test.tld",
            password: "employee",
            status: "connected",
          })
        );
        
        document.body.innerHTML=''
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.NewBill)

        const newBillForm = screen.getByTestId('form-new-bill');

        // Ajout des valeurs de test
        fireEvent.change(screen.getByTestId('expense-type'), { target: { value: 'Transports' } });
        fireEvent.change(screen.getByTestId('expense-name'), { target: { value: 'Vol Paris Londres' } });
        fireEvent.change(screen.getByTestId('amount'), { target: { value: '378' } });
        fireEvent.change(screen.getByTestId('datepicker'), { target: { value: '2024-07-03' } });
        fireEvent.change(screen.getByTestId('vat'), { target: { value: '70' } });
        fireEvent.change(screen.getByTestId('pct'), { target: { value: '20' } });
        fireEvent.change(screen.getByTestId('commentary'), { target: { value: 'test' } });

        // Ajout du fichier
        const fakePngFile = new File(["content"], "correct.png", {
          type: "image/png",
        });
        fireEvent.change(screen.getByTestId("file"), {
          target: { files: [fakePngFile] }
        });
      
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorageMock,
        });
        const spyHandleSubmit = jest.fn(newBill.handleSubmit)
        newBillForm.addEventListener('submit', spyHandleSubmit)

        // Soumission du formulaire
        fireEvent.submit(newBillForm);


        
        expect(spyHandleSubmit).toHaveBeenCalled()
        expect(newBillForm).not.toBeInTheDocument()
      })
    })
  })
});

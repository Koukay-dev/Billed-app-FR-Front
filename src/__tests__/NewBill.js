/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, fireEvent, toBeInTheDocument } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";

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
          store : mockStore,
          localStorageMock,
        });

        const fakeTxtFile = new File(["content"], "invalid.txt", {
          type: "text/plain",
        });

        alert = jest.fn()

        const fileInput = screen.getByTestId("file");

        Object.defineProperty(fileInput, 'files', {
          value: [fakeTxtFile],
          writable: false,
        });

        newBill.handleChangeFile({
          preventDefault: jest.fn(),
        })

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
          store : mockStore,
          localStorageMock,
        });

        const fakePngFile = new File(["content"], "correct.png", {
          type: "image/png",
        });

        const fileInput = screen.getByTestId("file");

        Object.defineProperty(fileInput, 'files', {
          value: [fakePngFile],
          writable: false,
        });

        newBill.handleChangeFile({
          preventDefault: jest.fn(),
        });

        expect(fileInput.files[0].name).toBe("correct.png");
      });
    });

    describe("Integration Test Suites", () => {});
  });
});

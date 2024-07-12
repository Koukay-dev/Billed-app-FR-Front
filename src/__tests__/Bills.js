/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore)
console.log = jest.fn()


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {


    describe("Unit Test Suites", () => {
      test("Then bills should be ordered from earliest to latest", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const dates = screen
          .getAllByText(
            /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
          )
          .map((a) => a.innerHTML);
        const antiChrono = (a, b) => (a < b ? 1 : -1);
        const datesSorted = [...dates].sort(antiChrono);
        expect(dates).toEqual(datesSorted);
      });

      test("handleClickIconEye unit test should open a modal with the icon information", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        document.body.innerHTML = BillsUI({ data: bills });
        const BillsCtnr = new Bills({
          document,
          onNavigate,
          store :mockStore,
          localStorageMock,
        });
        const eyeIcons = screen.getAllByTestId("icon-eye");

        $.fn.modal = jest.fn();
        eyeIcons.forEach(async (eyeIcon) => {
          const billUrl = eyeIcon.getAttribute("data-bill-url");
          const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
          BillsCtnr.handleClickIconEye(eyeIcon);

          const modalDOM = await waitFor(() => screen.getbyRole("dialog"));
          const imgElement = modalDOM.querySelector("img");
          expect(imgElement).toHaveAttribute("width", `${imgWidth}`);
          expect(imgElement).toHaveAttribute("src", billUrl);
        });
      });
    });







    describe("integration test suites", () => {


      beforeEach(() => {
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

        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();

      });


      test("Then bill icon in vertical layout should be highlighted", async () => {
        window.onNavigate(ROUTES_PATH.Bills);
        await waitFor(() => screen.getByTestId("icon-window"));
        const windowIcon = screen.getByTestId("icon-window");
        // expect ajouté
        expect(windowIcon.classList).toContain("active-icon");
      });

      // test integration GET
      test("fetches bills from mock API GET", async () => {
        console.log(mockStore)
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        window.onNavigate(ROUTES_PATH.Bills);
        const BillsCtnr = new Bills({document, onNavigate,  store: mockStore, localStorageMock});
        console.log(BillsCtnr)
        await waitFor(() => screen.getByTestId("tbody"));
        expect(screen.getByTestId("tbody")).not.toBeEmptyDOMElement();
        BillsCtnr.getBills()
          .then((data) => {
            expect(data).toBeTruthy();
          })
          .catch((e) => console.log(e));
      });

      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
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
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
      })
    });
  });
});

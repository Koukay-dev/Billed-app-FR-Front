/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import BillsCtn from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      // expect ajouté
      expect(windowIcon.classList).toContain("active-icon");
    });

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
      document.body.innerHTML = BillsUI({ data: bills });
      const eyeIcons = screen.getAllByTestId("icon-eye");

      eyeIcons.forEach(async (eyeIcon) => {
        const billUrl = eyeIcon.getAttribute("data-bill-url");
        const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
        BillsCtn.handleClickIconEye(eyeIcon);

        const modal = await waitFor(() => screen.getbyRole("dialog"));
        const imgElement = modal.querySelector("img");
        expect(imgElement).toBeTruthy();
        expect(imgElement).toHaveAttribute("width", `${imgWidth}`);
        expect(imgElement).toHaveAttribute("src", billUrl);
      });
    });

    // when(
    //   "I click on the Eye Icon a modal containing the image from the selected bills should display",
    //   async () => {
    //     // test intégration du fonctionnement de cette fonction
    //     Object.defineProperty(window, "localStorage", {
    //       value: localStorageMock,
    //     });
    //     window.localStorage.setItem(
    //       "user",
    //       JSON.stringify({
    //         type: "Employee",
    //       })
    //     );
    //     const root = document.createElement("div");
    //     root.setAttribute("id", "root");
    //     document.body.append(root);
    //     router();
    //     window.onNavigate(ROUTES_PATH.Bills);
    //     await waitFor(() => screen.getByTestId("icon-eye"));
    //     const eyeIcon = screen.getByTestId("icon-eye");
    //     expect();
    //   }
    // );

    // when("I click on the New Bill Button I should the new Bill Page", () =>
    //   it("should redirect to the NewBill Page", () => {})
    // );

    // test("The Bills should display properly with correct information", () => {
    //   // Test GetBills
    // });
  });
});

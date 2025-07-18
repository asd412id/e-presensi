import { atom, selector } from "recoil";

// Atom untuk menyimpan data user, dengan inisialisasi dari localStorage jika ada
export const userState = atom({
  key: "userState",
  default: (() => {
    try {
      const user = localStorage.getItem("user");

      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  })(),
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((newUser) => {
        if (newUser) {
          localStorage.setItem("user", JSON.stringify(newUser));
        } else {
          localStorage.removeItem("user");
        }
      });
    },
  ],
});

// Selector untuk mendapatkan status login
export const isLoggedInSelector = selector({
  key: "isLoggedInSelector",
  get: ({ get }) => {
    const user = get(userState);

    return !!user;
  },
});

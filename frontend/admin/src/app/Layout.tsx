import { Header } from "@/widgets/Header";
import { FunctionComponent } from "react";
import styles from "./styles/styles.module.css";
import { Outlet } from "react-router-dom";
import { SideNavigation } from "@/widgets/SideNavigation";

export const Layout: FunctionComponent = () => {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <SideNavigation />
        <div className={styles.bodyContainer}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

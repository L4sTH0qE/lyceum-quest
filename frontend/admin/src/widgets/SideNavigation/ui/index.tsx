import { FunctionComponent } from "react";
import styles from "./styles.module.css";
import { SideNavItem } from "@/shared/ui/SideNavItem";

export const SideNavigation: FunctionComponent = () => {
  return (
    <div className={styles.sidebar}>
      <nav>
        <ul>
          <SideNavItem href="/" iconName="analytics">
            Аналитика
          </SideNavItem>
          <SideNavItem href="/quests" iconName="quests">
            Квесты
          </SideNavItem>
          <SideNavItem href="/characters" iconName="characters">
            Персонажи
          </SideNavItem>
        </ul>
      </nav>
      <ul>
        <SideNavItem href="/settings" iconName="settings">
          Настройки
        </SideNavItem>
      </ul>
    </div>
  );
};

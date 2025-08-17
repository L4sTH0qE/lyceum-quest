import { FunctionComponent } from "react";
import { Link, useLocation } from "react-router-dom";
import classNames from "classnames";
import styles from "./styles.module.css";
import { Props } from "../lib/types";
import { Icon } from "../../Icon";

export const SideNavItem: FunctionComponent<Props> = ({
  children,
  className,
  iconName,
  href,
}) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link to={href}>
      <li
        className={classNames(styles.navigationItem, {
          [styles.active]: isActive,
          [styles[className!]]: className,
        })}
      >
        <Icon
          size="xl"
          type={iconName}
          className={isActive ? ["activeIcon"] : ["icon"]}
        />
        <h3>{children}</h3>
      </li>
    </Link>
  );
};

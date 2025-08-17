/// <reference types="vite-plugin-svgr/client" />
import LogoutIcon from "../icons/logout.svg?react";
import AnalyticsIcon from "../icons/analytics.svg?react";
import QuestsIcon from "../icons/quests.svg?react";
import CharactersIcon from "../icons/characters.svg?react";
import SettingsIcon from "../icons/settings.svg?react";
import CloseIcon from "../icons/close.svg?react";
import Info from "../icons/info.svg?react";
import AlertTriangle from "../icons/alert-triangle.svg?react";
import CheckCircle from "../icons/check-circle.svg?react";
import AlertOctagon from "../icons/alert-octagon.svg?react";
import PaperClip from "../icons/paperclip.svg?react";
import Trash from "../icons/trash.svg?react";
import SendIcon from "../icons/send.svg?react";
import DotsIcon from "../icons/dots.svg?react";
import AddIcon from "../icons/add.svg?react";

import EditIcon from "../icons/editIcon.svg?react";

import { MouseEvent } from "react";

export type IconType =
  | "logout"
  | "analytics"
  | "quests"
  | "characters"
  | "settings"
  | "close"
  | "success"
  | "notice"
  | "warning"
  | "delete"
  | "attachment"
  | "send"
  | "edit"
  | "dots"
  | "add"
  | "error";

export type IconProps = {
  className?: string[];
  toast?: boolean;
  onClick?: (event: MouseEvent<SVGSVGElement>) => void;
  type: IconType;
};

export const iconsMap: {
  [key in IconType]: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
} = {
  logout: LogoutIcon,
  analytics: AnalyticsIcon,
  quests: QuestsIcon,
  characters: CharactersIcon,
  settings: SettingsIcon,
  close: CloseIcon,
  notice: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertOctagon,
  attachment: PaperClip,
  delete: Trash,
  send: SendIcon,
  edit: EditIcon,
  dots: DotsIcon,
  add: AddIcon,
};

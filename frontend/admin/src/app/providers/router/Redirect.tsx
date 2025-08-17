import { FC, useEffect } from "react";
import { RedirectProps } from "./types/types";

const Redirect: FC<RedirectProps> = ({ url }) => {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return <h5>Такая страница не найдена, перенаправляю в Лицей...</h5>;
};

export default Redirect;

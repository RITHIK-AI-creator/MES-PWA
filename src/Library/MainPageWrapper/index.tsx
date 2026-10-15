import React from "react";
import * as Styled from "./index.styled";

interface PageWrapperProps {
  children: React.ReactNode;
  pageTitle:string;
}

const MainPageWrapper: React.FC<PageWrapperProps> = ({ children,pageTitle }) => {
  return <Styled.Container>
    {children}
    </Styled.Container>;
};

export default MainPageWrapper;
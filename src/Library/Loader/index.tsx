import React from "react";
import * as Styled from "./index.styled";
const Loader=()=>{
  return(
    <Styled.SpinnerOverlay>
              <Styled.Spinner />
            </Styled.SpinnerOverlay>
  )
}

export default Loader;
import styled from "styled-components"
import { device } from '../lib/sizes'
import { LIGHT_BORDER, WHITE } from "../lib/constants"
import { useLoadingAlert } from "../lib/hooks/loading-alert"
import Spinner from "react-svg-spinner"

export const LoadingAlert = () => {
    const { message } = useLoadingAlert()

    return <LoadingAlertContainer visible={message?.length > 0}>
        <div>{message || ""}</div>
        <div><Spinner /></div>
    </LoadingAlertContainer>
}

const LoadingAlertContainer = styled.div<{ visible: boolean }>`
position: fixed;
z-index: 320;
top: 10px;
left: 10px;
right: 10px;
font-size: 90%;
padding: 15px;
text-align: center;
user-select: none;
font-size: 16px;

display: flex;
justify-content: center;
align-items: center;

background-color: ${WHITE};
border: 1px solid ${LIGHT_BORDER};
border-radius: 4px;

transform: ${props => props.visible ? "translate(0px, 0px)" : "translate(0px, -90px)"};
opacity: ${props => props.visible ? "1" : "0"};

transition: transform .1s ease-out, opacity .1s ease-out;

@media ${device.mobileL} {
    left: 15vw;
    right: 15vw;
}

@media ${device.tablet} {
    justify-content: flex-end;
    text-align: right;
    top: 80px;
    left: unset;
    max-width: 330px;
    right: 10px;

    transform: ${props => props.visible ? "translate(0px, 0px)" : "translate(360px, 0px)"};
}

& > div:first-child {
    margin-right: 15px;
}
& > div:last-child {
    padding-top: 4px;
}
`

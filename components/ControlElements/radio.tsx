import React from "react";
import styled from "styled-components";
import { Radio } from "@aragon/ui";
import { When } from "react-if";

import { Tooltip } from "../tooltip";

const RadioContainer = styled.div`
  display: flex;
  flex-direction: column;

  & > label:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
`;

const RadioLabelText = styled.p`
  margin: 0px 0px 0px 8px;
  font-size: 16px;
`;

export type TextContent = {
  label: string;
  tooltip?: string;
};

type RadioTooltipProps = {
  texts: TextContent[];
  state: number;
  setState: (index: number) => void;
};

/* NOTE AragonUI provides a RadioGroup that covers the button's state logic. However, it doesn't
allow to properly insert Tootlips into the group. This is why the Radio section has been
"reimplemented" here. To use radio buttons without tooltips refer to AragonUI. */

/**
 * Provides a group of radio buttons. The number of options is dynamic and based on the
 * number of labels passed in the texts array.
 *
 * The state and setState function propagate the Radio section state up to the parent.
 * I.e., it tells the parent component which option is currently selected. The parent must
 * therefore provide a state variable and an according setter variable to track this
 * information. Typically, using the useState hook. Note: this useState hook needs to be a
 * number (or an enum type).
 *
 * @param texts Array of textual information for both labels and tooltips.
 * @param state Number that keeps track of the marked radio button. 0 indexed.
 * @param setState Function that takes a number as argument and returns nothing. That
 * number represents the selected option. 0 indexed.
 */
export function RadioSectionTooltips({ texts, state, setState }: RadioTooltipProps) {
  return (
    <RadioContainer>
      {texts.map((t, key) => (
        <RadioLabel>
          <Radio
            checked={key === state}
            onChange={() => {
              setState(key);
            }}
          />
          <RadioLabelText>{t.label}</RadioLabelText>
          <When condition={texts[key].tooltip}>
            <Tooltip hoverText={texts[key].tooltip} />
          </When>
        </RadioLabel>
      ))}
    </RadioContainer>
  );
}

export default RadioSectionTooltips;

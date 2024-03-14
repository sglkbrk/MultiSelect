import React, { useState } from "react";
import { Story, Meta, ComponentMeta } from "@storybook/react";

import MultiSelect from "../src";
import { items } from "./constants";
import { IMultiselectProps } from "../src/multiselect/interface";

export default {
  title: "Multiselect Basic",
  component: MultiSelect,
} as ComponentMeta<typeof MultiSelect>;

const Template: Story<IMultiselectProps> = (args) => <MultiSelect {...args} />;

export const BasicItems = Template.bind({});
BasicItems.args = {
  options: items,
  displayValue: "key",
};

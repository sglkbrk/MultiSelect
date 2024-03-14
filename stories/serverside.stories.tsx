import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import React, { useState } from "react";
import { Story, ComponentMeta } from "@storybook/react";

import MultiSelect from "../src";
import { IMultiselectProps } from "../src/multiselect/interface";
import { useLazyQuery, gql } from "@apollo/client";

export default {
  title: "Multiselect Serverside",
  component: MultiSelect,
} as ComponentMeta<typeof MultiSelect>;

const Template: Story<IMultiselectProps> = (args) => <MultiSelect {...args} />;

const range = (size: number): Array<number> =>
  Array.from(new Array(size + 1).keys()).slice(1);

const client = new ApolloClient({
  uri: "https://rickandmortyapi.com/graphql", // GraphQL sunucunuzun URL'si
  cache: new InMemoryCache(),
});

export const Serverside = () => {
  return (
    <ApolloProvider client={client}>
      <AsynchronousLoading />
    </ApolloProvider>
  );
};

const AsynchronousLoading = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const GET_DATA = gql`
    query Characters($name: String!) {
      characters(filter: { name: $name }) {
        info {
          count
        }
        results {
          name
          status
          gender
          image
        }
      }
      location(id: 1) {
        id
      }
      episodesByIds(ids: [1, 2]) {
        id
      }
    }
  `;

  const [getCharacterData, { loading, error, data }] = useLazyQuery(GET_DATA);
  const handleSearch = (value: string) => {
    if (value.length >= 3) {
      getCharacterData({ variables: { name: value } });
    }
    console.log(value);
  };
  return (
    <MultiSelect
      options={data?.characters ? data.characters.results : []}
      onSearch={handleSearch}
      loading={loading}
      displayValue="name"
    />
  );
};

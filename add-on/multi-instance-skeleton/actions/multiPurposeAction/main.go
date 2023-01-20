// Copyright 2023 VMware, Inc.
// SPDX-License-Identifier: BSD-2-Clause
package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"os"
)

type InputProperties struct {
	Element    string         `json:"element"`
	Event      string         `json:"event"`
	Properties map[string]any `json:"properties"`
}

type OutputProperty struct {
	Name   string `json:"name"`
	Value  any    `json:"value"`
	Secure bool   `json:"secure"`
}

type OutputProperties []OutputProperty

func readPropertiesFromStandardInput() InputProperties {
	scanner := bufio.NewScanner(os.Stdin)
	if !scanner.Scan() {
		exitIfErrorExists(errors.New("no standard input"), "error reading from standard input")
	}
	inputJson := scanner.Text()

	// DEVELOPMENT ONLY! Print standard input for examination.
	// Note all secrets will be visible in the standard output log.
	fmt.Println(inputJson)

	input := InputProperties{}
	err := json.Unmarshal([]byte(inputJson), &input)
	exitIfErrorExists(err, "error reading JSON from standard input")
	return input
}

func (o OutputProperty) writePropertyIntoStandardOutput() error {
	if variableJson, err := json.Marshal(o); err != nil {
		return err
	} else {
		_, err = fmt.Println(fmt.Sprintf("output:%s", string(variableJson)))
		return err
	}
}

func (properties OutputProperties) writePropertiesIntoStandardOutput() {
	for _, property := range properties {
		if err := property.writePropertyIntoStandardOutput(); err != nil {
			fmt.Errorf("failed serializing the output for variable %s:%v", property.Name, err)
			os.Exit(1)
		}
	}
}

func exitIfErrorExists(err error, message string) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "%s: %v", message, err)
		os.Exit(1)
	}
}

const eventPreCreate = "PreCreate"
const eventPostCreate = "PostCreate"
const eventPostDelete = "PostDelete"
const elementNone = ""
const elementCloudDirectorUser = "cloud-director-user"

// This is the body of the multipurpose action handler. It is going to be called multiple times with for various
// places where it is referenced by the manifest.yaml#triggers and manifest.yaml#element#triggers.
//
// Use multipurpose action pattern for convenience or source code size reduction and usability.
func main() {
	fmt.Println("Solution add-on trigger has been called")

	inputProperties := readPropertiesFromStandardInput()

	// Example: Handle solution add-on global triggers
	if inputProperties.Element == elementNone && inputProperties.Event == eventPreCreate {
		fmt.Println("solution pre-create event")

		// Example: set or update multiple solution add-on global properties at once
		OutputProperties{
			{Name: "exampleKeyMap", Value: map[string]any{"k1": "v1", "k2": "v2"}, Secure: false},
			{Name: "exampleKeyArrayAny", Value: []any{1, "v", true, map[string]bool{"k": true}}, Secure: false},
		}.writePropertiesIntoStandardOutput()

	}

	if inputProperties.Element == elementNone && inputProperties.Event == eventPostDelete {
		fmt.Println("solution post-delete event")
	}

	// Example: Handle solution add-on trigger for specific element
	if inputProperties.Element == elementCloudDirectorUser && inputProperties.Event == eventPostCreate {
		fmt.Println("solution pre-create event")

		// Example: Set or update a solution add-on global property
		OutputProperty{
			Name: "api-token", Value: "XXX API Token XXX", Secure: true,
		}.writePropertyIntoStandardOutput()
	}

	fmt.Println("Solution add-on trigger terminated")
}

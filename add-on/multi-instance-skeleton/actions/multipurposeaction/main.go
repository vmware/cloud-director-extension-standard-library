// Copyright 2023 VMware, Inc.
// SPDX-License-Identifier: BSD-2-Clause
package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"time"
)

type Context struct {
	Element       string         `json:"element"`
	Event         string         `json:"event"`
	Operation     string         `json:"operation"`
	Properties    map[string]any `json:"properties"`
	CloudDirector map[string]any `json:"cloudDirector"`
}

type TransactionLog map[string]any

type Task struct {
	Operation string `json:"operation"`
}

type Log struct {
	Level string `json:"level"`
	Msg   string `json:"msg"`
}

type Property struct {
	Name   string `json:"name"`
	Value  any    `json:"value"`
	Secure bool   `json:"secure"`
}

type OutputTask struct {
	Task Task `json:"task"`
}

type OutputLog struct {
	Log Log `json:"log"`
}

type OutputTransactionLog struct {
	Transaction TransactionLog `json:"transaction"`
}

type OutputProperty struct {
	Property Property `json:"property"`
}

func writeContext(contexts ...any) (err error) {
	for _, context := range contexts {
		var ctxJson []byte
		if ctxJson, err = json.Marshal(context); err == nil {

			var outputKey string

			switch value := context.(type) {
			case Task:
				outputKey = "task"
			case Log:
				outputKey = "log"
			case TransactionLog:
				outputKey = "transaction"
			case Property:
				outputKey = "property"
			default:
				return fmt.Errorf("unknown type %v", value)
			}

			_, err = fmt.Printf("%s:%s\n", outputKey, string(ctxJson))
		}
		if err != nil {
			break
		}
	}
	return
}

func readContext() Context {
	scanner := bufio.NewScanner(os.Stdin)
	if !scanner.Scan() {
		exitIfErrorExists(errors.New("no standard input"), "error reading from standard input")
	}
	inputJson := scanner.Text()

	// DEVELOPMENT ONLY! Print standard ctx for examination.
	// Note all secrets will be visible in the standard output log.
	fmt.Println(inputJson)

	ctx := Context{}
	err := json.Unmarshal([]byte(inputJson), &ctx)
	exitIfErrorExists(err, "error reading JSON from standard ctx")
	return ctx
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
const eventOnOperation = "OnOperation"
const elementNone = ""
const elementCloudDirectorUser = "cloud-director-user"

const operationUpdateCloudDirectorCertificate = "UPDATECLOUDDIRECTORCERTIFICATE"
const operationUpdateTrustedStore = "UPDATETRUSTEDSTORE"

// This is the multipurpose action handler that can be referenced multiple times
// in the manifest.yaml under triggers and element triggers sections.
//
// Utilize this pattern for code simplicity, reduced source code size, and improved usability.
func main() {
	// Write into action standard out put, not visible to the user, used for debugging purposes
	fmt.Println("Solution add-on trigger has been called")

	// Read context from the standard input stream
	ctx := readContext()

	// Example: Handle solution add-on global triggers
	if ctx.Element == elementNone && ctx.Event == eventPreCreate {
		// Example: Forward output into user log
		writeContext(
			Log{Level: "info", Msg: "Executing solution pre-create event"},
		)

		// Example: Write state in transaction log
		writeContext(
			TransactionLog{"Atomic Operation A": "Begin"},
		)

		// Example: Beginning of long-running task
		writeContext(
			Task{Operation: "Perform time consuming operation A"},
		)

		// Example: Long-running tasks is executing
		time.Sleep(time.Second)

		// Example: Write state in transaction log
		writeContext(
			TransactionLog{"Atomic Operation A": "Completed"},
		)

		// Example: Completing the previous long-running task and beginning of a new long-running task.
		// Task B will be completed automatically on action completion.
		writeContext(
			Task{Operation: "Perform time consuming operation B"},
		)

		// Example: set or update multiple solution add-on global properties at once
		writeContext(
			Property{Name: "exampleKeyMap", Value: map[string]any{"k1": "v1", "k2": "v2"}, Secure: false},
			Property{Name: "exampleKeyArrayAny", Value: []any{1, "v", true, map[string]bool{"k": true}}, Secure: false},
		)
	}

	if ctx.Element == elementNone && ctx.Event == eventPostDelete {
		writeContext(
			Log{Level: "info", Msg: "Executing solution post-delete event"},
		)
	}

	// Example: Handle solution add-on trigger for specific element
	if ctx.Element == elementCloudDirectorUser && ctx.Event == eventPostCreate {
		writeContext(
			Log{Level: "info", Msg: "Executing element user pre-create event"},
		)

		// Example: Set or update a solution add-on global property
		writeContext(
			Property{Name: "api-token", Value: "XXX API Token XXX", Secure: true},
		)
	}

	if ctx.Element == elementNone && ctx.Event == eventOnOperation {

		if ctx.Operation == operationUpdateCloudDirectorCertificate {
			vcdCerts := ctx.CloudDirector["certificates"]

			writeContext(
				Log{Level: "info", Msg: "Adding the Cloud Director certificate into trusted store"},
				Log{Level: "debug", Msg: fmt.Sprintf("Cloud Director Certificate: %v", vcdCerts)},
			)

		} else if ctx.Operation == operationUpdateTrustedStore {
			cert := ctx.Properties["certificate"]
			writeContext(
				Log{Level: "info", Msg: "Adding a certificate into trusted store"},
				Log{Level: "debug", Msg: fmt.Sprintf("Certificate: %v", cert)},
			)
		} else {
			panic(fmt.Errorf("Unrecognized operation: %s", ctx.Operation))
		}
	}

	fmt.Println("Solution add-on trigger terminated")
}

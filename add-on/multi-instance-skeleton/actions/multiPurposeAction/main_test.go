package main

import (
	_ "embed"
	"log"
	"os"
	"testing"
)

//go:embed addonPreCreateMock.json
var inputContext []byte

func mock(t *testing.T, input []byte) (funcDefer func(), err error) {
	t.Helper()
	var file *os.File
	file, err = os.CreateTemp(os.TempDir(), "test")
	if _, err = file.Write(input); err == nil {
		if _, err = file.Seek(0, 0); err == nil {
			oldOsStdin := os.Stdin
			os.Stdin = file

			funcDefer = func() {
				os.Stdin = oldOsStdin
				os.Remove(file.Name())
			}
		}
	}
	return
}

func Test(t *testing.T) {
	deferFunc, err := mock(t, inputContext)
	if err != nil {
		log.Fatal(err)
	}
	defer deferFunc()
	main()
}

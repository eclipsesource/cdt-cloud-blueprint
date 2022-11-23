# Raspberry Pi Pico - Blink Example

Blinks an LED on a Raspberry Pi Pico.

## Prerequisite

The Raspberry Pi Pico SDK has to be available on your system.
The most common way is to to clone the SDK locally:

    git clone https://github.com/raspberrypi/pico-sdk.git

Then, set the environment variable `$PICO_SDK_PATH` to the SDK location in your environment:

    export PICO_SDK_PATH=<your-path>/pico-sdk

Alternatively, you can pass it directly (`-DPICO_SDK_PATH=`) to cmake later.

For more information, please see the README in the [pico-sdk](https://github.com/raspberrypi/pico-sdk) repository.

## Build The Blink Example

To build the example, run the task `Binary build` via Menu `Terminal > Run task...`.

Alternatively, you can run the cmake command directly in a new Terminal (Menu `Terminal > New Terminal`):

    cmake . -B build -DCMAKE_BUILD_TYPE=Debug -DCMAKE_EXPORT_COMPILE_COMMANDS=1 && make -C build -j4

## Debug The Blink Example

To debug the example it comes with a launch configuration.
Select the `Debug blink example` launch config in the debug view and run it.
This will trigger the `Binary build` task and start the example in debug mode.

## Supported Features

Below are some features that can be tried out:

- Syntax highlighting
- Building the code
- Code completion / Content assist (after building)
  - Trigger via <kbd>Ctrl</kbd>+<kbd>Space</kbd> or by typing a trigger character (such as the dot character (`.`) in JavaScript).
- Cross-file navigation (after building)
  - Open a file
    - via `Ctrl + Click`
    - via <kbd>F3</kbd>
  - Open a file by its name via <kbd>Ctrl</kbd>+<kbd>P</kbd> (Quick Open).
- Debugging (after building)    
- Memory Inspector (during debugging)


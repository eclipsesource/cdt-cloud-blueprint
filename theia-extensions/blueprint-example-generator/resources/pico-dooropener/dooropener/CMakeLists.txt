cmake_minimum_required(VERSION 3.12)

# initialize pico-sdk from GIT
# (note this can come from environment, CMake cache etc)
set(PICO_SDK_FETCH_FROM_GIT on)

# generate compile_commands.json
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Pull in SDK (must be before project)
include(pico_sdk_import.cmake)

include(additional_imports.cmake)
include_directories("${ARM_INCLUDE_PATH}")

project(dooropener C CXX ASM)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

if (PICO_SDK_VERSION_STRING VERSION_LESS "1.3.0")
    message(FATAL_ERROR "Raspberry Pi Pico SDK version 1.3.0 (or later) required. Your version is ${PICO_SDK_VERSION_STRING}")
endif()

set(PICO_EXAMPLES_PATH ${PROJECT_SOURCE_DIR})

# Initialize the SDK
pico_sdk_init()

add_executable(dooropener
        src/dooropener.c
        )

# pull in dependencies
target_link_libraries(dooropener pico_stdlib hardware_pwm hardware_clocks hardware_adc)

# create map/bin/hex file etc.
pico_add_extra_outputs(dooropener)

# enable usb output, disable uart output
pico_enable_stdio_usb(dooropener 1)
pico_enable_stdio_uart(dooropener 0)

# add url via pico_set_program_url
#example_auto_set_url(dooropener)

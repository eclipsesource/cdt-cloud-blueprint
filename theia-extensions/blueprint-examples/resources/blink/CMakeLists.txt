cmake_minimum_required(VERSION 3.13)

# initialize pico-sdk from GIT
# (note this can come from environment, CMake cache etc)
set(PICO_SDK_FETCH_FROM_GIT on)

# generate compile_commands.json
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# initialize the SDK based on PICO_SDK_PATH
# note: this must happen before project()
include(pico_sdk_import.cmake)

include(additional_imports.cmake)
include_directories("${ARM_INCLUDE_PATH}")

# set the project name and version
project(blink)

# initialize the Raspberry Pi Pico SDK
pico_sdk_init()

# Add an executable with the above sources
add_executable(blink
    src/blink.c
)

# Add pico_stdlib library which aggregates commonly used features
target_link_libraries(blink pico_stdlib)

# create map/bin/hex/uf2 file in addition to ELF.
pico_add_extra_outputs(blink)

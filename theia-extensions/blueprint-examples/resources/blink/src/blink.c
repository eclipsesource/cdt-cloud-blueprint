/**
 * Copyright (c) 2020 Raspberry Pi (Trading) Ltd.
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

#include <stdio.h>
#include "pico/stdlib.h" 

int main() {
    #ifndef PICO_DEFAULT_LED_PIN
    #warning blink example requires a board with a regular LED
    #else
        stdio_init_all();
        printf("\nstarting blinking");
        const uint LED_PIN = PICO_DEFAULT_LED_PIN;
        int ledStatus = 1; // start with LED ON
        gpio_init(LED_PIN);
        gpio_set_dir(LED_PIN, GPIO_OUT);
        while (true) {
            gpio_put(LED_PIN, ledStatus);
            printf("\nLED ON");
            sleep_ms(250);
            ledStatus--;
            gpio_put(LED_PIN, ledStatus);
            printf("\nLED OFF");
            sleep_ms(250);
            ledStatus++;
        }
    #endif
}
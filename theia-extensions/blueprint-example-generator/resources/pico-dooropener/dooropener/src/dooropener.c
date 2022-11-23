#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/pwm.h"
#include "hardware/clocks.h"
#include "hardware/adc.h"

int servoPin = 16;
int potPin = 26;

int doorClosedPosition = 820;
int doorOpenedPosition = 2400;

int potentiometerUpperBound = 4095;

float clockDiv = 64;
float wrap = 39062;

void setupServo(int pin)
{
    gpio_set_function(pin, GPIO_FUNC_PWM);
    uint slice_num = pwm_gpio_to_slice_num(pin);
    pwm_config config = pwm_get_default_config();
    uint64_t clockspeed = clock_get_hz(5);

    while (clockspeed/clockDiv/50 > 65535 && clockDiv < 256) clockDiv += 64; 
    wrap = clockspeed/clockDiv/50;

    pwm_config_set_clkdiv(&config, clockDiv);
    pwm_config_set_wrap(&config, wrap);
    pwm_init(slice_num, &config, true);
}

void setServoPosition(int pin, float position)
{
    pwm_set_gpio_level(pin, (position/20000.f)*wrap);
}

void openDoor() {
    setServoPosition(servoPin, doorOpenedPosition);
}

void closeDoor() {
    setServoPosition(servoPin, doorClosedPosition);
}

float readTemperature() {
    adc_select_input(4);
    uint16_t rawTempRead = adc_read();
    const float conversion_factor = 3.3f / (1<<12);
    float convertedRead = rawTempRead * conversion_factor;
    float temperatureCelsius = 27 - (convertedRead -0.706)/0.001721;
    return temperatureCelsius;
}

float readPotentiometer() {
    adc_select_input(0);
    return (float)adc_read();
}

int main() {
    stdio_init_all();
    setupServo(servoPin);

    adc_init();
    adc_gpio_init(26);
    adc_set_temp_sensor_enabled(true);
    
    closeDoor();

    while (true)
    {
        float temperatureCelsius = readTemperature();
        printf("Temp value: %f\n", temperatureCelsius);

        if (temperatureCelsius > 20) {
            printf("Opening door due to temperature");
            openDoor();
        } else if (temperatureCelsius < 12) {
            printf("Closing door due to temperature");
            closeDoor();
        } else if (temperatureCelsius < 18 && temperatureCelsius > 14) {
            float potentiometerValue = readPotentiometer();
            printf("Potentiometer value: %f\n", potentiometerValue);

            float percentage = potentiometerValue / potentiometerUpperBound;
            float doorRange = doorOpenedPosition - doorClosedPosition;
            float doorPosition = (doorRange * percentage) + doorClosedPosition;
            printf("Setting door position to %f\n", doorPosition);
            setServoPosition(servoPin, doorPosition);
        }

        sleep_ms(20);
    }
}

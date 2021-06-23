/*
* Some things to mention:
* 
*  - Conditionals that depend on values that are computed
*    at runtime should be avoided as things will not be properly
*    handled. This is why in the code two different sets of
*    odd and even values are both computed even though only one set
*    will be used. Using a conditional to compute only a single set
*    produced buggy behaviour.
* 
*  - The incoming fragTextCoord are the texture coordinates
*    at the centre of the pixel and not at it's edge.
*    For example, a pixel located at (5, 10) would give
*    fragTextCoord a value (5.5, 10.5) when multiplied by
*    the screen dimensions. This information is needed
*    when calculating the proper phi1 and phi2 variable angles.
* 
*/

#version 150 core

precision highp float;
varying highp vec2 fragTextCoord;
uniform sampler2D tex;
uniform float blockSize;
uniform int isVertical;
uniform float angleSign;
uniform float size;
uniform float scale;
const float tau = 6.283185307179586;

vec3 getOdd1(float x, float y) {
    return (isVertical == 0)? texture2D(tex, vec2(x + blockSize/2.0, y)).rgb:
                              texture2D(tex, vec2(x, y + blockSize/2.0)).rgb;
}

vec3 getEven2(float x, float y) {
    return (isVertical == 0)? texture2D(tex, vec2(x - blockSize/2.0, y)).rgb:
                              texture2D(tex, vec2(x, y - blockSize/2.0)).rgb;
}

void main() {
    float x = fragTextCoord.x;
    float y = fragTextCoord.y;
    float val = (isVertical == 0)? mod(x, blockSize): mod(y, blockSize);
    // even lower half
    vec3 even1 = texture2D(tex, fragTextCoord).rgb;
    vec3 odd1 = getOdd1(x, y);
    float phi1 = angleSign*tau*(val - 0.5/size)/(blockSize);
    vec3 expOdd1 = vec3(odd1.r*cos(phi1) - odd1.g*sin(phi1),
                            odd1.r*sin(phi1) + odd1.g*cos(phi1),
                            0.0);
    vec3 out1 = scale*(even1 + expOdd1);
    // odd upper half
    vec3 even2 = getEven2(x, y);
    vec3 odd2 = texture2D(tex, fragTextCoord).rgb;
    float phi2 = angleSign*tau*((val - 0.5/size) - blockSize/2.0)/(blockSize);
    vec3 expOdd2 = vec3(odd2.r*cos(phi2) - odd2.g*sin(phi2),
                            odd2.r*sin(phi2) + odd2.g*cos(phi2),
                            0.0);
    vec3 out2 = scale*(even2 - expOdd2);
    // TODO: is it better to use a conditional or to use the step
    // function?
    gl_FragColor = (val <= blockSize/2.0)? vec4(out1, 1.0): vec4(out2, 1.0); 
    // gl_FragColor = step(0.0, blockSize/2.0 - val)*vec4(out1, 1.0) +
    //                 step(0.0, val - blockSize/2.0)*vec4(out2, 1.0);
}
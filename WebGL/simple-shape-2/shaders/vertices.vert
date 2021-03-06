precision mediump float;
attribute vec4 pos;
attribute vec4 color;
attribute vec2 inputTextureCoord;
varying lowp vec4 color2;
uniform mat4 modelView;
uniform mat4 rotation;
uniform mat4 proj;
uniform float scale;
uniform highp vec4 rotationQuaternion;
varying highp vec2 textureCoord;
varying highp float lighting;


vec4 quaternionMultiply(vec4 q1, vec4 q2) {
    vec4 q3;
    q3.w = q1.w*q2.w - q1.x*q2.x - q1.y*q2.y - q1.z*q2.z;
    q3.x = q1.w*q2.x + q1.x*q2.w + q1.y*q2.z - q1.z*q2.y; 
    q3.y = q1.w*q2.y + q1.y*q2.w + q1.z*q2.x - q1.x*q2.z; 
    q3.z = q1.w*q2.z + q1.z*q2.w + q1.x*q2.y - q1.y*q2.x;
    return q3; 
}


vec4 rotate(vec4 x, vec4 r) {
    vec4 xr = quaternionMultiply(x, r);
    r.x = -r.x;
    r.y = -r.y;
    r.z = -r.z;
    vec4 x2 = quaternionMultiply(r, xr);
    x2.w = 1.0;
    return x2; 
}


vec4 project(vec4 x) {
    vec4 y;
    y[0] = x[0]*5.0/(x[2] + 5.0);
    y[1] = x[1]*5.0/(x[2] + 5.0);
    y[2] = x[2];
    y[3] = 1.0;
    return y;
}


vec4 changeColor(vec4 color, vec4 position, vec3 lightRay) {
    vec3 position3 = vec3(position.x, position.y, position.z);
    vec3 normalLightRay = normalize(lightRay);
    vec3 normalPosition = normalize(position3);
    vec4 newColor;
    for (int i = 0; i < 3; i++) {
            if (color[i] != 0.0) {
            newColor[i] = (
                dot(normalLightRay, normalPosition) <= 0.0
            )? 0.1*color[i]: color[i]*(0.1 + 1.0*dot(normalLightRay, normalPosition));
        }
    }
    newColor[3] = 1.0;
    return newColor;
}


void main() {
    // color2 = color;
    vec4 transformedPosition = project(rotate(scale*pos, rotationQuaternion));
    color2 = changeColor(color, transformedPosition, vec3(1.0, 0.0, -1.0));
    gl_Position = transformedPosition;
}

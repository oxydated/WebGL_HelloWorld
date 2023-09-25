#version 300 es

in vec2 a_position;

in vec2 a_texCoord;

out vec2 v_texCoord;

uniform vec2 u_resolution;

uniform mat2 rotationMatrix;

void main(){
  // convert the position from pixels to 0.0 to 1.0

  vec2 center = vec2(100, 100);

  vec2 moveToCenter = a_position - center;

  vec2 rotated = rotationMatrix * moveToCenter;

  vec2 moveFromCenter = rotated + center;

  vec2 zeroToOne = moveFromCenter / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 tp -1->+1 (clip space)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  v_texCoord = a_texCoord;
}
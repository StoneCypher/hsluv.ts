
import { line, point, angle } from './types';





const intersect_line_line = (a: line, b: line): point => {

  const x = (a.intercept - b.intercept) / (b.slope - a.slope),
        y = a.slope * x + a.intercept;

  return { x, y };

};





const distance_from_origin = (upoint: point): number =>

  Math.sqrt( Math.pow(upoint.x, 2) + Math.pow(upoint.y, 2) );





const distance_line_from_origin = (uline: line): number =>

  Math.abs(uline.intercept) / Math.sqrt(Math.pow(uline.slope, 2) + 1);





const perpendicular_through_point = (uline: line, upoint: point): line => {

    const slope     = -1 / uline.slope,
          intercept = upoint.y - slope * upoint.x;

    return { slope, intercept };

};





const angle_from_origin = (upoint: point): angle =>

  Math.atan2(upoint.y, upoint.x);





const normalize_angle = (uangle: angle): angle => {

  var m = 2 * Math.PI;
  return ((uangle % m) + m) % m;

}





const length_of_ray_until_intersect = (utheta: angle, uline: line): number =>
  /*
  theta  -- angle of ray starting at (0, 0)
  m, b   -- slope and intercept of line
  x1, y1 -- coordinates of intersection
  len    -- length of ray until it intersects with line

  b + m * x1        = y1
  len              >= 0
  len * cos(theta)  = x1
  len * sin(theta)  = y1


  b + m * (len * cos(theta)) = len * sin(theta)
  b = len * sin(hrad) - m * len * cos(theta)
  b = len * (sin(hrad) - m * cos(hrad))
  len = b / (sin(hrad) - m * cos(hrad))
  */
  uline.intercept / (Math.sin(utheta) - uline.slope * Math.cos(utheta));





export {

  intersect_line_line,
  distance_from_origin,
  distance_line_from_origin,
  perpendicular_through_point,
  angle_from_origin,
  normalize_angle,
  length_of_ray_until_intersect

};

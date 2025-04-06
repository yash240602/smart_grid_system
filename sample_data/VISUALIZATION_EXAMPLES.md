# Visualization Examples

Since we can't generate the actual plots due to environment constraints, below are textual representations of what the plots would look like.

## Voltage Time Series Plot

```
    Voltage (V)
    ^
245 |                                       x
    |                                       
240 |                       x               
    |                                       
235 |------------ Threshold ----------------|
    |                                       
230 |~~~~\/~~~~~~~~~~~\/~~~~/\~~~~~~\/~~~~~~|
    |                                       
225 |                                       
    |                                       
220 +---------------------------------------|-->
       00:00   06:00   12:00   18:00   00:00    Time
       
       Legend: ~~~~ Normal data   x Anomaly
```

## Anomaly Detection Plot

```
    Voltage (V)
    ^
245 |                                       X
    |                                       
240 |                       X               
    |                                       
235 |                                       
    |                                       
230 |⋅ ⋅⋅ ⋅⋅ ⋅⋅ ⋅⋅ ⋅⋅ ⋅⋅ ⋅⋅ ⋅⋅ ⋅⋅ ⋅⋅ ⋅⋅ ⋅ ⋅|
    |                                       
225 |    ⋅⋅                                 
    |                                       
220 +---------------------------------------|-->
       00:00   06:00   12:00   18:00   00:00    Time
       
       Legend: ⋅ Normal data   X Anomaly
```

## Voltage Prediction Plot

```
    Voltage (V)
    ^
235 |                                       
    |                                    ..--   
    |                                ..--     
230 |~~~~\/~~~~~~~~~~~\/~~~~/\~~--/~~        
    |                     ..--               
225 |                 ..--                   
    |                                       
220 +---------------------------------------|-->
       00:00   12:00   00:00   12:00   00:00    Time
                        |                |
                        |                |
                    Historical        Predicted
                       Data             Data
                       
       Legend: ~~~~ Historical data   ---- Prediction   ... Confidence interval
```

## Dashboard Integration

In the actual dashboard, these visualizations would be interactive:

- Clicking on an anomaly point would highlight the corresponding node in the grid
- Hovering over predictions would show exact values and confidence intervals
- Time range selectors would allow zooming into specific periods
- Anomaly alerts would be color-coded by severity

The dashboard combines these ML-powered visualizations with the grid topology graph to provide a comprehensive view of the smart grid system. 
# Proyecto donde esta Wally

# Introducción

Este código utiliza OpenCV para detectar al personaje "Wally" en una imagen. Se emplea un clasificador en cascada previamente entrenado para localizar a Wally en la imagen, y se dibujan rectángulos alrededor de las detecciones. Finalmente, se muestra la imagen resultante con las detecciones.

## Código y Explicación

### Importaciones y Carga de Imagen

```python
import numpy as np 
import cv2 as cv
import os

image = cv.imread(r'C:/Proyectos/IA/Buscar/9.jpg')
```

Se importan las bibliotecas necesarias (`numpy`, `opencv`, `os`) y se carga la imagen donde se buscará a Wally desde la ruta especificada.

### Conversión a Escala de Grises

```python
gray = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
```

La imagen se convierte a escala de grises, lo que simplifica el proceso de detección y reduce el costo computacional.

### Carga del Clasificador en Cascada

```python
wally = cv.CascadeClassifier(r'C:\Proyectos\IA\cascade.xml')
```

Se carga el clasificador en cascada para la detección de Wally desde un archivo XML.

### Detección de Wally

```python
#waldo_detections = wally.detectMultiScale(gray, scaleFactor=1.01, minNeighbors=470, minSize=(5,5))
#waldo_detections = wally.detectMultiScale(gray, scaleFactor=1.07, minNeighbors=762, minSize=(5,5))
#waldo_detections = wally.detectMultiScale(gray, scaleFactor=1.07, minNeighbors=12, minSize=(5,5))
waldo_detections = wally.detectMultiScale(gray, scaleFactor=1.07, minNeighbors=24, minSize=(5,5))
```

Se detecta a Wally en la imagen utilizando el método `detectMultiScale` del clasificador en cascada. Se han probado diferentes parámetros comentados, y el que se utiliza ajusta `scaleFactor`, `minNeighbors` y `minSize` para optimizar la detección.

### Dibujar Rectángulos alrededor de las Detecciones

```python
for (x, y, w, h) in waldo_detections:
    cv.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)
    cv.putText(image, 'Wally', (x, y-10), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
```

Se iteran las detecciones y se dibujan rectángulos verdes alrededor de cada detección. Además, se añade la etiqueta 'Wally' encima de cada rectángulo.

### Redimensionar y Mostrar la Imagen

```python
resize_factor = 0.7  # Factor de redimensionamiento
new_width = int(image.shape[1] * resize_factor)
new_height = int(image.shape[0] * resize_factor)
resized_image = cv.resize(image, (new_width, new_height))

# Mostrar la imagen redimensionada
cv.imshow('¿Donde esta Wally?', resized_image)
cv.waitKey(0)
cv.destroyAllWindows() 
```

La imagen se redimensiona para que sea más manejable en pantalla, y se muestra en una ventana. La ventana permanece abierta hasta que se presione una tecla, momento en el cual se cierra.

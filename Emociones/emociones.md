# Reconocimiento de emociones

# Introducción

Este código en Python implementa un sistema de reconocimiento de emociones faciales en tiempo real utilizando la cámara web del ordenador. Utiliza la biblioteca `opencv` (también conocida como `cv2`) para capturar y procesar imágenes, y un clasificador de reconocimiento facial basado en el modelo LBPH (Local Binary Patterns Histograms).

El objetivo del sistema es detectar rostros en el flujo de video en tiempo real y predecir la emoción de la persona utilizando un modelo preentrenado. Las emociones reconocidas en este ejemplo son "feliz", "sorprendido" y "triste". Cuando la confianza de la predicción es baja, el sistema etiquetará la emoción como "Neutral". 

A continuación se presenta una explicación detallada del funcionamiento del código.

# Explicación del Código

Este código está escrito en Python y utiliza las bibliotecas `numpy` y `opencv` para el reconocimiento de emociones faciales en tiempo real a través de una cámara web.

## Importaciones

```python
import numpy as np 
import cv2 as cv
import os
```

Se importan las bibliotecas necesarias: `numpy` para operaciones numéricas, `opencv` (`cv2`) para el procesamiento de imágenes y `os` para manejar las operaciones del sistema de archivos.

## Cargar el Clasificador de Rostros

```python
rostro = cv.CascadeClassifier('haarcascade_frontalface_alt.xml')
```

Se carga un clasificador en cascada preentrenado para la detección de rostros usando un archivo XML de Haar Cascade.

## Preparación del Conjunto de Datos

```python
dataSet = r'C:\Proyectos\IA\Emocione\emocione'
faces = os.listdir(dataSet)
print(faces)
```

Se define la ruta del conjunto de datos y se listan los archivos en ese directorio.

## Definir Emociones

```python
faces  = ['feliz', 'sorprendido', 'triste']
```

Se establece una lista de emociones que el modelo reconocerá: "feliz", "sorprendido" y "triste".

## Cargar el Reconocedor LBPH

```python
LBPHFace = cv.face.LBPHFaceRecognizer_create()
LBPHFace.read('emocionesLBPH.xml')
```

Se crea un objeto `LBPHFaceRecognizer` para el reconocimiento de rostros y se carga un modelo preentrenado desde un archivo XML.

## Captura de Video

```python
cap = cv.VideoCapture(0)
rostro = cv.CascadeClassifier(cv.data.haarcascades +'haarcascade_frontalface_alt.xml')
```

Se inicia la captura de video desde la cámara web (dispositivo 0) y se vuelve a cargar el clasificador de rostros.

## Bucle de Procesamiento de Video

```python
while True:
    ret, frame = cap.read()
    if ret == False: break
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    cpGray = gray.copy()
    rostros = rostro.detectMultiScale(gray, 1.3, 3)
    for(x, y, w, h) in rostros:
        frame2 = cpGray[y:y+h, x:x+w]
        frame2 = cv.resize(frame2,  (100,100), interpolation=cv.INTER_CUBIC)
        result = LBPHFace.predict(frame2)
        if result[1] > 93:
            cv.putText(frame,'{}'.format(faces[result[0]]),(x,y-25),2,1.1,(0,255,0),1,cv.LINE_AA)
            cv.rectangle(frame, (x,y),(x+w,y+h),(0,255,0),2)
        else:
            cv.putText(frame,'Neutral',(x,y-20),2,0.8,(0,0,255),1,cv.LINE_AA)
            cv.rectangle(frame, (x,y),(x+w,y+h),(0,0,255),2)
    
    cv.imshow('frame', frame)
    k = cv.waitKey(1)
    if k == 27:
        break
cap.release()
cv.destroyAllWindows()
```

### Explicación del Bucle

1. **Captura de Frame:**
   ```python
   ret, frame = cap.read()
   if ret == False: break
   ```
   Se captura un frame de la cámara. Si no se puede capturar, el bucle se rompe.

2. **Conversión a Escala de Grises:**
   ```python
   gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
   cpGray = gray.copy()
   ```
   Se convierte el frame a escala de grises para simplificar el procesamiento.

3. **Detección de Rostros:**
   ```python
   rostros = rostro.detectMultiScale(gray, 1.3, 3)
   ```
   Se detectan los rostros en la imagen utilizando el clasificador en cascada.

4. **Procesamiento de Cada Rostro:**
   ```python
   for(x, y, w, h) in rostros:
       frame2 = cpGray[y:y+h, x:x+w]
       frame2 = cv.resize(frame2,  (100,100), interpolation=cv.INTER_CUBIC)
       result = LBPHFace.predict(frame2)
       if result[1] > 93:
           cv.putText(frame,'{}'.format(faces[result[0]]),(x,y-25),2,1.1,(0,255,0),1,cv.LINE_AA)
           cv.rectangle(frame, (x,y),(x+w,y+h),(0,255,0),2)
       else:
           cv.putText(frame,'Neutral',(x,y-20),2,0.8,(0,0,255),1,cv.LINE_AA)
           cv.rectangle(frame, (x,y),(x+w,y+h),(0,0,255),2)
   ```

   - Se recorta y redimensiona cada rostro detectado.
   - Se predice la emoción del rostro usando el reconocedor LBPH.
   - Dependiendo de la confianza de la predicción (`result[1]`), se etiqueta la emoción o se muestra "Neutral".
   - Se dibuja un rectángulo alrededor del rostro y se añade la etiqueta correspondiente.

5. **Mostrar Frame:**
   ```python
   cv.imshow('frame', frame)
   ```

   Se muestra el frame procesado con las anotaciones de emociones.

6. **Salir del Bucle:**
   ```python
   k = cv.waitKey(1)
   if k == 27:
       break
   ```

   Si se presiona la tecla `ESC` (código 27), el bucle se rompe.

## Liberar Recursos

```python
cap.release()
cv.destroyAllWindows()
```

Se liberan los recursos de la cámara y se cierran todas las ventanas abiertas de OpenCV.
```
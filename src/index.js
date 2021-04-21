import gameLogicModule from './gameLogic'
import gameViewModule from './gameView'

gameViewModule.init(10)
gameLogicModule.init()

// Next Steps:

/*
   So wie es jetzt ist könnte ich mal Commit machen
   
   Boards verhauts gerade ziemlich noch wenn ich rauszoome

   Was gerade Problem: auch bei Klick auf bereits vorhandenes Feld macht
   Computer einen Zug. Wenn auf bereits gecklicktes Feld von Player geklicked wird
   sollte eig. nichts passieren oder?

   Wie der Code in gameView strukturiert ist gefällt mir teilweise gar nicht:
   z.B. paar Dom-Element ganz oben erstellt, paar Dom-Elemente in init usw...
   Vielleicht Alle ganz oben? Und in init nur Funktionen aufrufen?
   */

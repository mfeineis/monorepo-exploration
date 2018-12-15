module Main exposing (main)

import Browser
import Html exposing (Html)
import Intl
import Json.Decode as Decode exposing (Value)
import Translation exposing (LangKey(..), t)


main : Program Value Model Msg
main =
    Browser.document
        { init = init
        , update = \_ model -> ( model, Cmd.none )
        , subscriptions = always Sub.none
        , view = view
        }


type alias Model =
    { i18nKey : Maybe Intl.ContextKey
    , somePrice : Float
    }


type Msg
    = Noop


init : Value -> ( Model, Cmd Msg )
init flags =
    let
        i18nKey =
            Decode.decodeValue Intl.decodeContextKey flags
                |> Result.toMaybe
    in
    ( { i18nKey = i18nKey
      , somePrice = 3.14159
      }
    , Cmd.none
    )


showPrice : { ctx | somePrice : Float } -> Html msg -> Html msg
showPrice { somePrice } =
    Intl.element
        [ t (SomeOtherKey somePrice)
        , Intl.mapAttribute "title" (t (SomeOtherKey somePrice))
        ]


someInput : List (Html.Attribute msg) -> Html msg
someInput attrs =
    Intl.element
        [ Intl.mapAttribute "placeholder" (t SomePlaceholder) ]
        (Html.input attrs [])


view : Model -> Browser.Document Msg
view model =
    { title = "Hello World - Elm19"
    , body =
        [ Html.text "Hello World!"
        , case model.i18nKey of
              Nothing ->
                  Html.text "Translation problem!"

              Just i18nKey ->
                  Intl.context i18nKey
                      [ showPrice model (Html.text "")
                      , someInput []
                      , Intl.text (t SomePlaceholder)
                      , Intl.element
                          [ Intl.mapAttribute "placeholder"
                              (Intl.spec "some.unknownKey")
                          ]
                          (Html.input [] [])
                      , Intl.element
                          [ Intl.mapAttribute "placeholder" (t SomePlaceholder) ]
                          (Html.textarea [] [])
                      , Html.button []
                          [ Intl.text (t SomeButton)
                          ]
                      ]
        ]
    }

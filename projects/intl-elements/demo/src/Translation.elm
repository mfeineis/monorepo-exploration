module Translation exposing (LangKey(..), t)

import Intl exposing (Spec)
import Json.Encode as Encode


type LangKey
    = SomeButton
    | SomeOtherKey Float
    | SomePlaceholder



-- FIXME: The formats should really be strongly typed!


attachDollarFormat : Spec -> Spec
attachDollarFormat =
    Intl.mapFormats
        (Encode.object
            [ ( "number"
              , Encode.object
                    [ ( "USD"
                      , Encode.object
                            [ ( "style", Encode.string "currency" )
                            , ( "currency", Encode.string "USD" )
                            ]
                      )
                    ]
              )
            ]
        )


attachPrice : Float -> Spec -> Spec
attachPrice price =
    -- FIXME: We get runtime errors when the values don't fit or
    --        if they are omitted :-/
    Intl.mapValues
        (Encode.object
            [ ( "price", Encode.float price )
            ]
        )


t : LangKey -> Spec
t key =
    case key of
        SomeButton ->
            Intl.spec "some.otherKey"
                |> attachPrice 0.02
                |> attachDollarFormat

        SomeOtherKey price ->
            Intl.spec "some.otherKey"
                |> attachPrice price
                |> attachDollarFormat

        SomePlaceholder ->
            Intl.spec "some.placeholder"

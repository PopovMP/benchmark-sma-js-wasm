(module

(memory 100)

(global $bars     (mut i32) (i32.const 0))
(global $pricePtr (mut i32) (i32.const 0))
(global $smaPtr   (mut i32) (i32.const 0))

;; Push price
(func $push (export "pushPrice") (param $price f64)
    ;; $pricePtr[$bars * 8] = $price
    (f64.store (i32.add (global.get $pricePtr)
                        (i32.mul (global.get $bars)
                                 (i32.const 8)))
               (local.get $price))

    ;; $bars = $bars + 1
    (global.set $bars (i32.add (global.get $bars)
                               (i32.const 1))))

;; Calculate smultiple SMA with periods 1 - $maxPeriods
(func (export "testSma") (param $maxPeriod i32)
    (local $period i32)
    (local.set $period (i32.const 1))
    (loop $testLoop
        ;; if $period < $maxPeriod
        (if (i32.lt_s (local.get $period)
                      (local.get $maxPeriod))
            (block
                ;; sma($period)
                (call $sma (local.get $period))

                ;; $period = $period + 1
                (local.set $period (i32.add (local.get $period)
                                       (i32.const 1)))
                (br $testLoop)))))

;; Calculate SMA for the given period
(func $sma (export "sma") (param $period i32)
    (local $bar     i32)
    (local $offset  i32)
    (local $sum     f64)
    (local $fperiod f64)

    (global.set $smaPtr (i32.mul (global.get $bars)
                                 (i32.const 8)))

    (local.set $fperiod (f64.convert_i32_s (local.get $period)))

    ;; Init MA
    (local.set $bar (i32.const 0))
    (local.set $sum (f64.const 0))
    (loop $initLoop
        (if (i32.lt_s (local.get $bar)
                      (local.get $period))
            (block
                ;; $offset = $bar * 8
                (local.set $offset (i32.mul (local.get $bar)
                                            (i32.const 8)))

                ;; $sma[$offset] = 0
                (f64.store (i32.add (global.get $smaPtr)
                                    (local.get  $offset))
                           (f64.const 0))

                ;; $sum = $sum + price[$offset]
                (local.set $sum (f64.add (local.get $sum)
                                         (f64.load (i32.add (global.get $pricePtr)
                                                            (local.get  $offset)))))

                ;; $bar = $bar + 1
                (local.set $bar (i32.add (local.get $bar)
                                         (i32.const  1)))

                (br $initLoop))))

    ;; $sma[$period - 1] = $sum / $fperiod
    (f64.store (i32.add (global.get $smaPtr)
                        (i32.mul (i32.sub (local.get $period)
                                          (i32.const 1))
                                 (i32.const 8)))
               (f64.div (local.get $sum)
                        (local.get $fperiod)))

    ;; Calcualte SMA
    (local.set $bar (local.get $period))
    (loop $smaLoop
        (if (i32.lt_s (local.get  $bar )
                      (global.get $bars))
            (block
                ;; $offset = $bar * 8
                (local.set $offset (i32.mul (local.get $bar)
                                            (i32.const 8)))

                ;; $sma[$offset] = $sma[$offset-8] + ($price[$offset] - $price[$offset - $period*8]) / $fperiod
                (f64.store (i32.add (global.get $smaPtr)
                                    (local.get  $offset))
                           (f64.add
                                    ;; $sma[$offset-8]
                                    (f64.load (i32.add (global.get $smaPtr)
                                                       (i32.sub (local.get $offset)
                                                                (i32.const 8))))

                                    (f64.div (f64.sub
                                                    ;; $price[$offset]
                                                    (f64.load (i32.add (global.get $pricePtr)
                                                                       (local.get  $offset  )))

                                                    ;; $price[$offset - $period*8]
                                                    (f64.load (i32.add (global.get $pricePtr)
                                                                    (i32.sub (local.get $offset)
                                                                             (i32.mul (local.get $period)
                                                                                      (i32.const 8))))))
                                                (local.get $fperiod))))

                ;; $bar = $bar + 1
                (local.set $bar (i32.add (local.get $bar)
                                         (i32.const  1)))

                (br $smaLoop)))))

;; Get SMA at $bar
(func (export "getSma") (param $bar i32) (result f64)
    (f64.load (i32.add (global.get $smaPtr)
                       (i32.mul (local.get $bar)
                                (i32.const 8)))))
)

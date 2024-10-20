"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronsUpDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const cryptoAssets = [
  { value: "btc", label: "Bitcoin (BTC)", lastPrice: 50000, change24h: 2.5 },
  { value: "eth", label: "Ethereum (ETH)", lastPrice: 3000, change24h: -1.8 },
  { value: "ada", label: "Cardano (ADA)", lastPrice: 1.5, change24h: 3.2 },
  { value: "sol", label: "Solana (SOL)", lastPrice: 150, change24h: -0.5 },
  { value: "dot", label: "Polkadot (DOT)", lastPrice: 30, change24h: 1.7 },
  { value: "xrp", label: "Ripple (XRP)", lastPrice: 1.2, change24h: -2.1 },
  { value: "doge", label: "Dogecoin (DOGE)", lastPrice: 0.3, change24h: 5.6 },
  { value: "avax", label: "Avalanche (AVAX)", lastPrice: 80, change24h: 0.9 },
  { value: "link", label: "Chainlink (LINK)", lastPrice: 25, change24h: -1.3 },
  { value: "uni", label: "Uniswap (UNI)", lastPrice: 20, change24h: 4.2 }
]

export default function CryptoAssets() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  return (
    <motion.div
      className="flex-1 overflow-y-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <div className="border rounded-lg p-6">
              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
                <TabsContent value="buy">
                  <div className="space-y-4">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outlined"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                        >
                          {value
                            ? cryptoAssets.find((asset) => asset.value === value)?.label
                            : "Select an asset..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search asset..." />
                          <CommandList>
                            <CommandEmpty>No asset found.</CommandEmpty>
                            <CommandGroup>
                              {cryptoAssets.map((asset) => (
                                <CommandItem
                                  key={asset.value}
                                  value={asset.value}
                                  onSelect={(currentValue) => {
                                    setValue(currentValue === value ? "" : currentValue)
                                    setOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      value === asset.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {asset.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="spend" className="text-sm font-medium">Spend (AUD)</label>
                        <Input id="spend" placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="receive" className="text-sm font-medium">You'll receive</label>
                        <Input id="receive" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="tertiary">Deposit AUD</Button>
                      <Button variant="primary">Continue</Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="sell">
                  <p>Sell functionality coming soon.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="border rounded-lg p-6">
              <Tabs defaultValue="popular" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="popular">Most popular</TabsTrigger>
                  <TabsTrigger value="movers">Top movers (24 hours)</TabsTrigger>
                </TabsList>
                <TabsContent value="popular">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Last price</TableHead>
                        <TableHead>24h % change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cryptoAssets.map((asset) => (
                        <TableRow key={asset.value}>
                          <TableCell>{asset.label}</TableCell>
                          <TableCell>${asset.lastPrice.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "flex items-center",
                              asset.change24h >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {asset.change24h.toFixed(2)}%
                              {asset.change24h >= 0 ? (
                                <ArrowUpRight className="ml-1 h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="ml-1 h-4 w-4" />
                              )}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="movers">
                  <p>Top movers functionality coming soon.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
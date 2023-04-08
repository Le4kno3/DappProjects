import React from 'react'
import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import AccountBoxIcon from '@mui/icons-material/AccountBox'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

const Header = () => {
  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <React.Fragment>
      <AppBar sx={{ background: '#00cccc' }}>
        <Toolbar>
          <AccountBoxIcon sx={{ color: 'black' }} />
          <Typography sx={{ color: 'black' }}>Takshil's Profile</Typography>
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label="App 1" />
                <Tab label="App 2" />
                <Tab label="App 3" />
              </Tabs>
            </Box>
          </Box>
          <Button sx={{ marginLeft: 'auto' }} variant="contained">
            {' '}
            Wallet
          </Button>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  )
}

export default Header
